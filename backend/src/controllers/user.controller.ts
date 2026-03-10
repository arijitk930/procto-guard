import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

import jwt, { JwtPayload } from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get data from frontend (now explicitly requiring role)
  const { fullName, email, username, password, role } = req.body;

  // 2. Validation - check if ANY field is empty (added role to the array)
  if (
    [fullName, email, username, password, role].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2b. Strict Role Validation
  if (!["student", "educator"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'student' or 'educator'");
  }

  // 3. Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // 4. Create user object
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    role, // No longer defaulting to student, taking the exact role from the frontend
  });

  // 5. Remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    createdUser._id.toString() as string,
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // 6. Return response
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered and logged in successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get email, password, AND role from req.body
  const { email, password, role } = req.body;

  // 2. Validation: Ensure all fields are present
  if (!email || !password || !role) {
    throw new ApiError(400, "Email, password, and role are required");
  }

  // 3. Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // --- NEW SECURITY CHECK: Verify the Role ---
  if (user.role !== role) {
    // 403 Forbidden is perfect here. They exist, but are trying to access the wrong portal.
    throw new ApiError(
      403,
      `Access denied. This email is registered as a ${user.role}.`,
    );
  }
  // -------------------------------------------

  // 4. Verify Password using the model method
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // 5. Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id.toString(),
  );

  // 6. Get sanitized user object
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // 1. Clear the refresh token in the database
  // req.user is available thanks to the verifyJWT middleware
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  // 2. Clear cookies in the user's browser
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  // 1. Extract the Refresh Token from cookies or header
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token found");
  }

  try {
    // 2. Verify the token using your secret
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as JwtPayload;

    // 3. Find the user in DB
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User not found");
    }

    // 4. Critical Security Check: Does the token match the one in the DB?
    // This prevents "Token Reuse" if an old token was leaked
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // 5. Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id.toString());

    const options = {
      httpOnly: true,
      secure: true,
    };

    // 6. Return response with new cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    // 1. Validation
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Both old and new passwords are required");
    }

    // 2. Find user (req.user is provided by verifyJWT)
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 3. Verify old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }

    // 4. Update the password
    user.password = newPassword;

    // 5. Save the user
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  },
);

const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // The verifyJWT middleware already attached the user object to req.user
  // and removed sensitive fields like password.
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};
