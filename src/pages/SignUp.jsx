import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { userService } from "../services/user.service";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";

// type SignUpForm = {
//   email: string;
//   password: string;
//   confirmPassword: string;
//   name: string;
//   userName: string;
// };

export default function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const password = watch("password");

  const onSubmit = async (data) => {
    setError("");
    try {
      const { userName, password, email, name } = data;
      setIsLoading(true);
      await userService.register({
        userName,
        password,
        email,
        name,
      });
      navigate("/login");
    } catch (err) {
      console.error("Register failed:", err);
      setError("Sign up failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-10">
      <div className="shadow-md rounded-lg p-6 w-96 bg-gray-50">
        <h2 className="text-2xl font-bold text-center color-primary mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-500">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-sky-300"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-500">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-sky-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1} // tránh focus khi tab qua form
            >
              {showPassword ? (
                <IoEyeOffOutline size={18} />
              ) : (
                <IoEyeOutline size={18} />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-gray-500">Confirm Password</label>
            <input
              type={showPasswordConfirm ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-sky-300"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPasswordConfirm ? (
                <IoEyeOffOutline size={18} />
              ) : (
                <IoEyeOutline size={18} />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-500">Full Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-sky-300"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-500">User Name</label>
            <input
              type="text"
              {...register("userName", { required: "Username is required" })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-sky-300"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userName.message}
              </p>
            )}
          </div>

          {/* Error from API */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2 rounded-md text-white font-semibold ${
              isValid
                ? "bg-primary hover:bg-sky-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? "⏳ Loading..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 text-sm color-primary">
          <button
            onClick={() => navigate("/login")}
            className="hover:underline"
          >
            Already have an account? Login
          </button>
        </div>

        {/* Google Sign Up */}
        <div className="mt-4">
          <button
            onClick={() => alert("Google Sign-Up clicked")}
            className="w-full py-2 border rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
