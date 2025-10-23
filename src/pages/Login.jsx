import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../services/auth.service";

export default function Login() {
  const { register, handleSubmit, formState } = useForm({
    mode: "onChange",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setError("");
    try {
      await authService.login(data.email, data.password); // call login
      navigate("/"); // go to home after login
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center px-6 py-10">
      <div className="shadow-md rounded-lg p-6 w-96 bg-gray-50">
        <h2 className="text-2xl font-bold text-center color-primary mb-6">
          Login
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
            Login
          </button>
        </form>

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
