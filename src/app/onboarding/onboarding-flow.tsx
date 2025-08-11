"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface OnboardingFlowProps {
    user: User;
}

export default function OnboardingFlow({ user }: OnboardingFlowProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        age: "",
        location: "",
        occupation: "",
        maritalStatus: "",
        dependents: "0",
        hobbies: [] as string[],
        interests: [] as string[],
        lifestyle: "moderate",
        incomeRange: "",
        riskTolerance: "moderate",
        primaryGoal: "",
        goalTargetAmount: "",
    });

    const totalSteps = 4;

    const hobbiesOptions = [
        "travel", "gaming", "fitness", "cooking", "reading", "music",
        "sports", "photography", "gardening", "technology", "art", "movies"
    ];

    const interestsOptions = [
        "technology", "finance", "health", "education", "entertainment",
        "business", "science", "environment", "fashion", "food"
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayToggle = (field: "hobbies" | "interests", value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            // TODO: Save to database via tRPC
            console.log("Onboarding data:", formData);

            // For now, just redirect to dashboard
            router.push("/");
        } catch (error) {
            console.error("Error saving onboarding data:", error);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Tell us about yourself
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange("age", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="25"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="San Francisco, CA"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                            <input
                                type="text"
                                value={formData.occupation}
                                onChange={(e) => handleInputChange("occupation", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Software Engineer"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                                <select
                                    value={formData.maritalStatus}
                                    onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dependents</label>
                                <select
                                    value={formData.dependents}
                                    onChange={(e) => handleInputChange("dependents", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4+">4+</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            What are your interests?
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Hobbies (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {hobbiesOptions.map((hobby) => (
                                    <button
                                        key={hobby}
                                        type="button"
                                        onClick={() => handleArrayToggle("hobbies", hobby)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.hobbies.includes(hobby)
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {hobby.charAt(0).toUpperCase() + hobby.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                General Interests (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {interestsOptions.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => handleArrayToggle("interests", interest)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.interests.includes(interest)
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["frugal", "moderate", "luxury"].map((lifestyle) => (
                                    <button
                                        key={lifestyle}
                                        type="button"
                                        onClick={() => handleInputChange("lifestyle", lifestyle)}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${formData.lifestyle === lifestyle
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {lifestyle.charAt(0).toUpperCase() + lifestyle.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Financial Information
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income Range</label>
                            <select
                                value={formData.incomeRange}
                                onChange={(e) => handleInputChange("incomeRange", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select your income range...</option>
                                <option value="under_30k">Under $30,000</option>
                                <option value="30k_50k">$30,000 - $50,000</option>
                                <option value="50k_75k">$50,000 - $75,000</option>
                                <option value="75k_100k">$75,000 - $100,000</option>
                                <option value="100k_150k">$100,000 - $150,000</option>
                                <option value="150k_plus">$150,000+</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: "conservative", label: "Conservative", desc: "Prefer safety over growth" },
                                    { value: "moderate", label: "Moderate", desc: "Balanced risk and reward" },
                                    { value: "aggressive", label: "Aggressive", desc: "Higher risk for higher returns" }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleInputChange("riskTolerance", option.value)}
                                        className={`p-4 rounded-lg text-sm transition-colors text-left ${formData.riskTolerance === option.value
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs opacity-80">{option.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Financial Goals
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Financial Goal</label>
                            <select
                                value={formData.primaryGoal}
                                onChange={(e) => handleInputChange("primaryGoal", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select your primary goal...</option>
                                <option value="emergency_fund">Build Emergency Fund</option>
                                <option value="house">Buy a House</option>
                                <option value="retirement">Save for Retirement</option>
                                <option value="debt_payoff">Pay Off Debt</option>
                                <option value="vacation">Save for Vacation</option>
                                <option value="investment">Start Investing</option>
                                <option value="education">Education Fund</option>
                            </select>
                        </div>

                        {formData.primaryGoal && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Amount (if applicable)
                                </label>
                                <input
                                    type="number"
                                    value={formData.goalTargetAmount}
                                    onChange={(e) => handleInputChange("goalTargetAmount", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="25000"
                                />
                            </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">🎉 Almost Done!</h3>
                            <p className="text-blue-800 text-sm">
                                After completing your profile, you'll be able to connect your bank accounts
                                and start receiving personalized financial recommendations.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm text-gray-500">
                        {Math.round((currentStep / totalSteps) * 100)}% Complete
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {currentStep === totalSteps ? (
                    <button
                        onClick={handleComplete}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Complete Profile
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}