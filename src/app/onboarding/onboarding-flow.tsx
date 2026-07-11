//src/app/onboarding/onboarding-flow.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Shield, Rocket, Sparkles, User as UserIcon, MapPin, Briefcase, Heart } from "lucide-react";
import { buttons, typography } from "~/lib/design";

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface OnboardingFlowProps {
    user: User;
}

const STEPS = [
    { number: 1, label: "Personal", title: "Personal Info", subtitle: "Basic details for personalized recommendations" },
    { number: 2, label: "Lifestyle", title: "Lifestyle & Interests", subtitle: "Help us understand your spending patterns" },
    { number: 3, label: "Financial", title: "Financial Profile", subtitle: "Income and risk preferences" },
    { number: 4, label: "Goals", title: "Financial Goals", subtitle: "What are you working toward?" },
];

const inputClass = "fancy-input";
const inputIconClass = "fancy-input fancy-input-icon";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-indigo-600/70";

const iconWrapClass = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400/60";

const chipClass = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
        active
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
            : "bg-white/70 text-slate-600 ring-1 ring-slate-200/50 hover:bg-white hover:ring-indigo-300/50 hover:shadow-sm"
    }`;

const cardButtonClass = (active: boolean) =>
    `rounded-2xl p-3.5 text-center text-sm transition-all duration-200 ${
        active
            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30"
            : "bg-white/70 text-slate-600 ring-1 ring-slate-200/50 hover:bg-white hover:ring-indigo-300/50 hover:shadow-sm"
    }`;

export default function OnboardingFlow({ user }: OnboardingFlowProps) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

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
        "Travel", "Gaming", "Fitness", "Cooking", "Reading", "Music",
        "Sports", "Photography", "Gardening", "Technology", "Art", "Movies"
    ];

    const interestsOptions = [
        "Technology", "Finance", "Health", "Education", "Entertainment",
        "Business", "Science", "Environment", "Fashion", "Food"
    ];

    // Auto-scroll the current step card into view
    useEffect(() => {
        if (scrollRef.current) {
            const cards = scrollRef.current.querySelectorAll("[data-step-card]");
            const currentCard = cards[currentStep - 1];
            if (currentCard) {
                currentCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }
        }
    }, [currentStep]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError("");
    };

    const handleArrayToggle = (field: "hobbies" | "interests", value: string) => {
        const lower = value.toLowerCase();
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(lower)
                ? prev[field].filter(item => item !== lower)
                : [...prev[field], lower]
        }));
        if (error) setError("");
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.age || !formData.location || !formData.occupation || !formData.maritalStatus) {
                    setError("Please fill in all required fields");
                    return false;
                }
                break;
            case 2:
                if (formData.hobbies.length === 0 || formData.interests.length === 0) {
                    setError("Please select at least one hobby and one interest");
                    return false;
                }
                break;
            case 3:
                if (!formData.incomeRange) {
                    setError("Please select your income range");
                    return false;
                }
                break;
            case 4:
                if (!formData.primaryGoal) {
                    setError("Please select your primary financial goal");
                    return false;
                }
                break;
        }
        return true;
    };

    const goToStep = (step: number) => {
        // Allow going back freely, but validate before going forward
        if (step > currentStep) {
            if (!validateStep(currentStep)) return;
        }
        setCurrentStep(step);
        setError("");
    };

    const isStepComplete = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.age && formData.location && formData.occupation && formData.maritalStatus);
            case 2:
                return formData.hobbies.length > 0 && formData.interests.length > 0;
            case 3:
                return !!formData.incomeRange;
            case 4:
                return !!formData.primaryGoal;
            default:
                return false;
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            setError("");
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError("");
        }
    };

    const handleComplete = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!validateStep(currentStep)) return;
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save onboarding data');
            }
            router.push("/?onboarding=complete");
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            setError(error instanceof Error ? error.message : "Failed to save your profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStepStatus = (stepNum: number) => {
        if (stepNum < currentStep) return "complete";
        if (stepNum === currentStep) return "current";
        return "next";
    };

    const getStepStatusLabel = (stepNum: number) => {
        if (stepNum < currentStep) return "COMPLETE";
        if (stepNum === currentStep) return "CURRENT";
        return "NEXT";
    };

    // Render the preview content for each step card
    const renderStepPreview = (stepNum: number) => {
        const isCurrent = stepNum === currentStep;

        switch (stepNum) {
            case 1:
                return (
                    <div className="space-y-3">
                        <div>
                            <label className={labelClass}>Age</label>
                            {isCurrent ? (
                                <div className="relative">
                                    <div className={iconWrapClass}><UserIcon className="h-4 w-4" /></div>
                                    <input type="number" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} className={inputIconClass} placeholder="28" min="18" max="100" />
                                </div>
                            ) : (
                                <div className={`${inputClass} pointer-events-none text-slate-500`}>{formData.age || "28"}</div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Location</label>
                            {isCurrent ? (
                                <div className="relative">
                                    <div className={iconWrapClass}><MapPin className="h-4 w-4" /></div>
                                    <input type="text" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} className={inputIconClass} placeholder="San Francisco, CA" />
                                </div>
                            ) : (
                                <div className={`${inputClass} pointer-events-none text-slate-500`}>{formData.location || "San Francisco, CA"}</div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Occupation</label>
                            {isCurrent ? (
                                <div className="relative">
                                    <div className={iconWrapClass}><Briefcase className="h-4 w-4" /></div>
                                    <input type="text" value={formData.occupation} onChange={(e) => handleInputChange("occupation", e.target.value)} className={inputIconClass} placeholder="Software Engineer" />
                                </div>
                            ) : (
                                <div className={`${inputClass} pointer-events-none text-slate-500`}>{formData.occupation || "Software Engineer"}</div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Marital Status</label>
                            {isCurrent ? (
                                <div className="relative">
                                    <div className={iconWrapClass}><Heart className="h-4 w-4" /></div>
                                    <select value={formData.maritalStatus} onChange={(e) => handleInputChange("maritalStatus", e.target.value)} className={inputIconClass}>
                                        <option value="">Select...</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                        <option value="widowed">Widowed</option>
                                    </select>
                                </div>
                            ) : (
                                <div className={`${inputClass} pointer-events-none capitalize text-slate-500`}>{formData.maritalStatus || "Single"}</div>
                            )}
                        </div>
                        {isCurrent && (
                            <>
                                <div>
                                    <label className={labelClass}>Dependents</label>
                                    <select value={formData.dependents} onChange={(e) => handleInputChange("dependents", e.target.value)} className={inputClass}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4+</option>
                                    </select>
                                </div>
                                <button
                                    onClick={(e) => handleNext(e)}
                                    disabled={!isStepComplete(1)}
                                    className={`${buttons.primary} mt-2 w-full py-3 ${isStepComplete(1) ? "" : "cursor-not-allowed opacity-50"}`}
                                >
                                    Continue
                                </button>
                            </>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Hobbies</label>
                            <div className="flex flex-wrap gap-1.5">
                                {(isCurrent ? hobbiesOptions : hobbiesOptions.slice(0, 6)).map((hobby) => (
                                    <button
                                        key={hobby}
                                        type="button"
                                        onClick={isCurrent ? () => handleArrayToggle("hobbies", hobby) : undefined}
                                        className={`${chipClass(formData.hobbies.includes(hobby.toLowerCase()))} ${!isCurrent ? "pointer-events-none text-xs" : ""}`}
                                    >
                                        {hobby}
                                    </button>
                                ))}
                                {isCurrent && hobbiesOptions.slice(6).map((hobby) => (
                                    <button
                                        key={hobby}
                                        type="button"
                                        onClick={() => handleArrayToggle("hobbies", hobby)}
                                        className={chipClass(formData.hobbies.includes(hobby.toLowerCase()))}
                                    >
                                        {hobby}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {isCurrent && (
                            <div>
                                <label className={labelClass}>Interests</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {interestsOptions.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => handleArrayToggle("interests", interest)}
                                            className={chipClass(formData.interests.includes(interest.toLowerCase()))}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className={labelClass}>Lifestyle</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { value: "frugal", icon: "🌍", label: "Frugal" },
                                    { value: "moderate", icon: "⚖️", label: "Moderate" },
                                    { value: "luxury", icon: "✨", label: "Luxury" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={isCurrent ? () => handleInputChange("lifestyle", opt.value) : undefined}
                                        className={`${cardButtonClass(formData.lifestyle === opt.value)} ${!isCurrent ? "pointer-events-none" : ""}`}
                                    >
                                        <div className="text-xl">{opt.icon}</div>
                                        <div className="mt-1 text-xs font-medium">{opt.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {isCurrent && (
                            <button
                                onClick={(e) => handleNext(e)}
                                disabled={!isStepComplete(2)}
                                className={`${buttons.primary} mt-2 w-full py-3 ${isStepComplete(2) ? "" : "cursor-not-allowed opacity-50"}`}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Income Range</label>
                            {isCurrent ? (
                                <select value={formData.incomeRange} onChange={(e) => handleInputChange("incomeRange", e.target.value)} className={inputClass}>
                                    <option value="">Select income range...</option>
                                    <option value="under_30k">Under $30,000</option>
                                    <option value="30k_50k">$30k – $50k</option>
                                    <option value="50k_75k">$50k – $75k</option>
                                    <option value="75k_100k">$75k – $100k</option>
                                    <option value="100k_150k">$100k – $150k</option>
                                    <option value="150k_plus">$150,000+</option>
                                </select>
                            ) : (
                                <div className={`${inputClass} pointer-events-none text-slate-500`}>
                                    {formData.incomeRange ? formData.incomeRange.replace(/_/g, " ").replace("k", ",000") : "$75k – $100k"}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Risk Tolerance</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { value: "conservative", icon: <Shield className="mx-auto h-5 w-5" />, label: "Safe" },
                                    { value: "moderate", icon: <Sparkles className="mx-auto h-5 w-5" />, label: "Moderate" },
                                    { value: "aggressive", icon: <Rocket className="mx-auto h-5 w-5" />, label: "Aggressive" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={isCurrent ? () => handleInputChange("riskTolerance", opt.value) : undefined}
                                        className={`${cardButtonClass(formData.riskTolerance === opt.value)} ${!isCurrent ? "pointer-events-none" : ""}`}
                                    >
                                        {opt.icon}
                                        <div className="mt-1 text-xs font-medium">{opt.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {isCurrent && (
                            <button
                                onClick={(e) => handleNext(e)}
                                disabled={!isStepComplete(3)}
                                className={`${buttons.primary} mt-2 w-full py-3 ${isStepComplete(3) ? "" : "cursor-not-allowed opacity-50"}`}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Primary Goal</label>
                            {isCurrent ? (
                                <select value={formData.primaryGoal} onChange={(e) => handleInputChange("primaryGoal", e.target.value)} className={inputClass}>
                                    <option value="">Select goal...</option>
                                    <option value="emergency_fund">Emergency Fund</option>
                                    <option value="house">Buy a House</option>
                                    <option value="retirement">Retirement</option>
                                    <option value="debt_payoff">Pay Off Debt</option>
                                    <option value="vacation">Vacation</option>
                                    <option value="investment">Investing</option>
                                    <option value="education">Education</option>
                                </select>
                            ) : (
                                <div className={`${inputClass} pointer-events-none text-slate-500`}>Emergency Fund</div>
                            )}
                        </div>
                        <div>
                            <label className={labelClass}>Target Amount</label>
                            {isCurrent ? (
                                <input type="number" value={formData.goalTargetAmount} onChange={(e) => handleInputChange("goalTargetAmount", e.target.value)} className={inputClass} placeholder="$50,000" min="0" />
                            ) : (
                                <div className={`${inputClass} pointer-events-none text-slate-500`}>{formData.goalTargetAmount ? `$${Number(formData.goalTargetAmount).toLocaleString()}` : "$50,000"}</div>
                            )}
                        </div>
                        {!isCurrent && (
                            <div className="space-y-2 pt-1">
                                {["Emergency Fund", "Retirement", "Travel Fund"].map((g) => (
                                    <div key={g} className="flex items-center gap-2 rounded-lg bg-white/40 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200/40">
                                        <div className="h-3 w-3 rounded bg-indigo-200" />
                                        {g}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isCurrent && (
                            <>
                                <div className="rounded-xl bg-indigo-50/60 p-3 ring-1 ring-indigo-200/40">
                                    <p className="text-xs text-indigo-700/80">
                                        After completing your profile, connect your bank accounts for personalized recommendations.
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleComplete(e)}
                                    disabled={isLoading || !isStepComplete(4)}
                                    className={`${buttons.primary} mt-1 w-full gap-2 py-3 ${isStepComplete(4) ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-emerald-600/50"}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>Complete Profile</span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Step Indicator Bar */}
            <div className="flex items-center justify-center gap-0">
                {STEPS.map((step, i) => {
                    const isComplete = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    return (
                        <div key={step.number} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => goToStep(step.number)}
                                className="flex flex-col items-center gap-1.5"
                            >
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                                        isComplete
                                            ? "bg-emerald-500 text-white shadow-sm"
                                            : isCurrent
                                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/25"
                                            : "bg-white/60 text-slate-400 ring-1 ring-slate-200/60"
                                    }`}
                                >
                                    {isComplete ? <CheckCircle className="h-5 w-5" /> : step.number}
                                </div>
                                <span
                                    className={`text-xs font-medium ${
                                        isCurrent ? "text-purple-700" : isComplete ? "text-emerald-600" : "text-slate-400"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`mx-2 mb-5 h-0.5 w-10 sm:w-16 ${
                                        currentStep > step.number ? "bg-emerald-400" : "bg-slate-200/60"
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Error Message (above cards) */}
            {error && (
                <div className="mx-auto max-w-2xl rounded-xl bg-red-50/60 p-3 ring-1 ring-red-200/40">
                    <p className="text-center text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Horizontal Step Cards */}
            <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory justify-center gap-5 overflow-x-auto px-4 pb-6 pt-2 scrollbar-hide sm:px-8"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {STEPS.map((step) => {
                    const status = getStepStatus(step.number);
                    const isCurrent = status === "current";
                    const isComplete = status === "complete";

                    return (
                        <div
                            key={step.number}
                            data-step-card
                            onClick={() => goToStep(step.number)}
                            className={`
                                flex-shrink-0 snap-center rounded-2xl p-5 transition-all duration-300 cursor-pointer
                                ${isCurrent
                                    ? "w-[340px] sm:w-[380px] scale-[1.02] step-card-active glass-card z-10"
                                    : "w-[260px] sm:w-[280px] glass-card opacity-70 hover:opacity-90 hover:shadow-md"
                                }
                            `}
                        >
                            {/* Step header */}
                            <div className="mb-3">
                                <div className={`text-[10px] font-bold uppercase tracking-widest ${
                                    isComplete ? "text-emerald-600" : isCurrent ? "text-purple-600" : "text-slate-400"
                                }`}>
                                    Step {step.number} — {getStepStatusLabel(step.number)}
                                </div>
                                <h3 className={`mt-1 font-bold ${isCurrent ? "text-lg text-slate-900" : "text-base text-slate-700"}`}>
                                    {step.title}
                                </h3>
                                {isCurrent && (
                                    <p className="mt-0.5 text-xs text-slate-500">{step.subtitle}</p>
                                )}
                            </div>

                            {/* Step content / preview */}
                            <div className={isCurrent ? "" : "pointer-events-none"}>
                                {renderStepPreview(step.number)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom navigation for mobile */}
            <div className="flex items-center justify-center gap-3 px-4 sm:hidden">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`${buttons.ghost} disabled:opacity-40`}
                >
                    Previous
                </button>
                <span className="text-xs text-slate-400">
                    {currentStep} of {totalSteps}
                </span>
                {currentStep < totalSteps && (
                    <button onClick={handleNext} className={buttons.primary}>
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}
