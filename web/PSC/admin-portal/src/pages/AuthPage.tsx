import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { authAdmin } from "../../config/apis";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAdmin(form);
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Logged in successfully",
          variant: "default",
        });
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        await queryClient.refetchQueries({ queryKey: ["currentUser"] });
        navigate("/")
        return;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-screen h-screen grid place-items-center bg-white">
      <div className="w-[90%] sm:w-1/3 h-[90%] rounded-2xl overflow-hidden shadow-2xl border border-black/10">
        {/* Header Section */}
        <div className="h-1/3 w-full flex flex-col items-center justify-center">
          <div className="font-bold text-[5rem] flex items-center justify-center rounded-full h-24 w-24 bg-black text-white">
            A
          </div>
          <p className="font-bold text-3xl text-black mt-2">Admin Panel</p>
          <p className="text-gray-600 text-sm">
            Sign in to manage your application
          </p>
        </div>

        {/* Form Section */}
        <div className="h-2/3 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-[80%] flex flex-col gap-5 text-black"
          >
            {/* Email */}
            <div className="flex flex-col gap-y-2">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-600"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-black/20 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-600" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-black/20 focus:outline-none focus:ring-2 focus:ring-black bg-white text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-700 hover:text-black"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-black text-white font-semibold py-2 rounded-lg hover:bg-black/90 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
