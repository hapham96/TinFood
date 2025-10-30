import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/auth.service";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
// type LoginForm = {
//   userName: string;
//   password: string;
// };

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);
    try {
      const success = await authService.login(data.userName, data.password);
      if (success) {
        navigate("/"); // ✅ Chuyển sang trang chính sau khi login thành công
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-10">
      <div className="shadow-md rounded-lg p-6 w-96 bg-gray-50">
        <h2 className="text-2xl font-bold text-center color-primary mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-500">Username</label>
            <input
              type="text"
              {...register("userName", {
                required: "Username is required",
              })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:ring focus:ring-sky-300"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userName.message}
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
              {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-2 rounded-md text-white font-semibold ${
              isValid && !isLoading
                ? "bg-primary hover:bg-sky-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Actions */}
        <div className="flex justify-between mt-4 text-sm color-primary">
          <button
            onClick={() => alert("Forgot password clicked")}
            className="hover:underline"
          >
            Forgot Password?
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="hover:underline"
          >
            Sign Up
          </button>
        </div>

        {/* Google Login */}
        <div className="mt-4">
          <button
            onClick={() => alert("Google Sign-In clicked")}
            className="w-full py-2 border rounded-md flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
