import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/auth.service";

export default function SignUp() {
  const { register, handleSubmit, watch, formState } = useForm({
    mode: "onChange",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setError("");
    try {
      // Call API register (fake demo -> login after sign up)
      await authService.login(data.email, data.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Sign up failed, please try again");
    }
  };

  // Validate confirm password
  const password = watch("password");

  return (
    <div className="flex items-center justify-center px-6 py-10">
      <div className="shadow-md rounded-lg p-6 w-96 bg-[#faf2e4]">
        <h2 className="text-2xl font-bold text-center color-primary mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-500">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:ring focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-gray-500">Password</label>
            <input
              type="password"
              {...register("password", { required: true })}
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:ring focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-gray-500">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: true,
                validate: (value) => value === password || "Passwords do not match",
              })}
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:ring focus:ring-sky-300"
            />
            {formState.errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-500">Phone</label>
            <input
              type="tel"
              {...register("phone", { required: true })}
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:ring focus:ring-sky-300"
            />
          </div>

          <div>
            <label className="block text-gray-500">Address</label>
            <input
              type="text"
              {...register("address", { required: true })}
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:ring focus:ring-sky-300"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!formState.isValid}
            className={`w-full py-2 rounded-md text-white ${
              formState.isValid
                ? "bg-sky-500 hover:bg-sky-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Sign Up
          </button>
        </form>

        <div className="text-center mt-4 text-sm color-primary">
          <button
            onClick={() => navigate("/login")}
            className="hover:underline"
          >
            Already have an account? Login
          </button>
        </div>

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
