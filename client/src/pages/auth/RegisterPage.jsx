// src/pages/RegisterPage.jsx
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = (e) => {
        e.preventDefault();

        setErrorMessage("");

        if (!name || !email || !password || !confirmPassword) {
            setErrorMessage("All fields are required");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setErrorMessage("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        console.log("Registration data:", { name, email, password });

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrorMessage("Registration successful! Redirecting...");
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-800">
                        <div className="p-8" style={{ backgroundColor: '#1E1E2F' }}>
                            <div className="relative mb-8">
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                                    <p className="text-gray-400 mt-2">Join us for an amazing cinema experience</p>
                                </div>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                {errorMessage && (
                                    <div className={`p-3 rounded-lg flex items-center ${
                                        errorMessage.includes("successful")
                                            ? "text-green-400 bg-green-900/30 border border-green-800"
                                            : "text-red-400 bg-red-900/30 border border-red-800"
                                    }`}>
                                        {errorMessage.includes("successful") ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {errorMessage}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="name">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                                            style={{ backgroundColor: '#2D2D42' }}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="email">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                                            style={{ backgroundColor: '#2D2D42' }}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                                            style={{ backgroundColor: '#2D2D42' }}
                                            placeholder="••••••••"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="confirm-password">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                                            style={{ backgroundColor: '#2D2D42' }}
                                            placeholder="••••••••"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        className="h-4 w-4 rounded focus:ring-purple-500 border-gray-600"
                                        style={{ backgroundColor: '#2D2D42' }}
                                    />
                                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                                        I agree to the <a href="#" className="text-purple-400 hover:underline">Terms and Conditions</a>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 rounded-lg font-semibold text-black text-lg hover:scale-[1.02] transform transition-all duration-200 shadow-lg"
                                    style={{
                                        backgroundColor: '#FFD700',
                                        backgroundImage: 'linear-gradient(45deg, #FFD700, #FFB700)'
                                    }}
                                >
                                    Create Account
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-gray-500">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                                        Sign in
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;