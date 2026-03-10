"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { trackLandingPageView, trackButtonClick } from "@/lib/firebase-analytics";
import {
    Zap,
    Brain,
    Target,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    Star,
    Users,
    Clock,
    BarChart3,
    Code2,
    Briefcase,
    PieChart,
    MessageSquare,
    Shield,
    Zap as Lightning,
    Award,
    Download,
    HelpCircle,
    ExternalLink,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import UploadResumeButton from "./UploadResumeButton";

const LandingPage = () => {
    const user = { id: "123" }
    const [currentSlide, setCurrentSlide] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            title: "Senior Software Engineer at Google",
            quote: "PrepWise helped me land my dream job at a top tech company. The AI feedback was incredibly accurate and helped me refine my answers. I went from being nervous to confident in just 3 weeks!",
            color: "blue"
        },
        {
            id: 2,
            name: "Michael Chen",
            title: "Product Manager at Microsoft",
            quote: "As someone changing careers from finance to tech, I was terrified. This platform gave me the confidence I needed. The practice interviews felt real and the feedback was incredibly actionable.",
            color: "purple"
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            title: "Data Scientist at Amazon",
            quote: "I improved from getting rejected at initial rounds to receiving final offers from three companies in just 2 weeks of using PrepWise. Absolutely worth every penny!",
            color: "green"
        },
        {
            id: 4,
            name: "David Kumar",
            title: "DevOps Engineer at Netflix",
            quote: "The system design questions were challenging but fair. The AI really understood infrastructure and gave specific, actionable feedback on my approach. Got hired after 4 practice interviews!",
            color: "red"
        },
        {
            id: 5,
            name: "Jessica Lee",
            title: "UX Designer at Apple",
            quote: "As a designer interviewing at a tech giant, I worried about technical depth. PrepWise coached me through every behavioral and technical question. Result? Got the job and a 15% higher salary than expected!",
            color: "pink"
        },
        {
            id: 6,
            name: "Alex Thompson",
            title: "Consultant at McKinsey",
            quote: "The case interview preparation was exceptional. Real-world scenarios, timing feedback, and structure guidance. PrepWise prepared me better than my MBA program. Highly recommend to anyone serious about consulting!",
            color: "indigo"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000); // Auto-rotate every 5 seconds

        return () => clearInterval(interval);
    }, [testimonials.length]);

    // Track landing page view
    useEffect(() => {
        trackLandingPageView();
    }, []);

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    };

    const getColorClasses = (color: string) => {
        const colors: { [key: string]: { bg: string; icon: string } } = {
            blue: { bg: "bg-blue-500/20", icon: "text-blue-400" },
            purple: { bg: "bg-purple-500/20", icon: "text-purple-400" },
            green: { bg: "bg-green-500/20", icon: "text-green-400" },
            red: { bg: "bg-red-500/20", icon: "text-red-400" },
            pink: { bg: "bg-pink-500/20", icon: "text-pink-400" },
            indigo: { bg: "bg-indigo-500/20", icon: "text-indigo-400" }
        };
        return colors[color] || colors.blue;
    };
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
            {/* Navbar */}
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
                    <p className="text-lg">
                        Practice real interview questions & get instant feedback
                    </p>

                    <UploadResumeButton isLoggedIn={!!user} />
                </div>

                <Image
                    src="/robot.png"
                    alt="robo-dude"
                    width={400}
                    height={400}
                    className="max-sm:hidden"
                />
            </section>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="mb-8 inline-block">
                    <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                        🎯 AI-Powered Interview Preparation
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    Master Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Interview Skills</span> with AI
                </h1>

                <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Practice real-world interview questions with our advanced AI interviewer. Get instant feedback, improve your answers, and land your dream job with confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link href="/sign-up">
                        <Button size="lg" className="cursor-pointer gap-2">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline" className="cursor-pointer">
                            Learn More
                        </Button>
                    </Link>
                </div>

                {/* Hero Image */}
            </section>

            {/* Stats Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
                        <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                        <p className="text-3xl font-bold text-white">10K+</p>
                        <p className="text-gray-400 mt-2">Candidates Trained</p>
                    </div>
                    <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
                        <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-4" />
                        <p className="text-3xl font-bold text-white">85%</p>
                        <p className="text-gray-400 mt-2">Success Rate</p>
                    </div>
                    <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
                        <Clock className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                        <p className="text-3xl font-bold text-white">30 Min</p>
                        <p className="text-gray-400 mt-2">Average Session</p>
                    </div>
                    <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 text-center">
                        <Users className="w-8 h-8 text-orange-400 mx-auto mb-4" />
                        <p className="text-3xl font-bold text-white">5★</p>
                        <p className="text-gray-400 mt-2">User Rating</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Powerful Features for Interview Success
                    </h2>
                    <p className="text-xl text-gray-400">
                        Everything you need to ace your interviews
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">AI-Powered Interviewer</h3>
                        <p className="text-gray-400">
                            Practice with an intelligent AI that adapts to your answers and provides real-time feedback just like a human interviewer.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Role-Specific Questions</h3>
                        <p className="text-gray-400">
                            Get questions tailored to your target role, industry, and experience level. From junior to executive positions.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Instant Feedback</h3>
                        <p className="text-gray-400">
                            Receive immediate analysis on your answers with actionable insights to improve for your next attempt.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Performance Tracking</h3>
                        <p className="text-gray-400">
                            Monitor your progress with detailed analytics and see improvements over time with easy-to-read reports.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Resume Parsing</h3>
                        <p className="text-gray-400">
                            Upload your resume and we'll customize interview questions based on your skills and experience.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/10">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Interview Simulations</h3>
                        <p className="text-gray-400">
                            Complete full-length mock interviews under timed conditions to build confidence and manage interview anxiety.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-r from-gray-900/50 to-gray-900/50 rounded-2xl border border-gray-800 my-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
                    How It Works
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Step 1 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400">
                            1
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Sign Up</h3>
                        <p className="text-gray-400">
                            Create your free account in seconds and choose your target role.
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center hidden md:flex">
                        <ArrowRight className="w-6 h-6 text-gray-600" />
                    </div>

                    {/* Step 2 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-400">
                            2
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Upload Resume</h3>
                        <p className="text-gray-400">
                            Share your resume for personalized question suggestions.
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center hidden md:flex">
                        <ArrowRight className="w-6 h-6 text-gray-600" />
                    </div>

                    {/* Step 3 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 border-2 border-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-400">
                            3
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Practice</h3>
                        <p className="text-gray-400">
                            Start your mock interview and respond to AI-generated questions.
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center hidden md:flex">
                        <ArrowRight className="w-6 h-6 text-gray-600" />
                    </div>

                    {/* Step 4 */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-orange-500/20 border-2 border-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-orange-400">
                            4
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Get Feedback</h3>
                        <p className="text-gray-400">
                            Receive detailed analysis and tips to improve your interview skills.
                        </p>
                    </div>
                </div>
            </section>

            {/* Industry Roles Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
                    Preparation for Every Role
                </h2>
                <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                    Whether you're aiming for tech, finance, product, or management roles, PrepWise has specialized content for your target position.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Software Engineer */}
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all">
                        <Code2 className="w-8 h-8 text-blue-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">Software Engineer</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Prepare for system design, coding challenges, and behavioral questions.
                        </p>
                        <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 cursor-pointer">
                            Get Started <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Product Manager */}
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all">
                        <PieChart className="w-8 h-8 text-purple-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">Product Manager</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Master case studies, metrics, and product strategy questions.
                        </p>
                        <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 cursor-pointer">
                            Get Started <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Data Science */}
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-green-500/50 transition-all">
                        <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">Data Scientist</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Prepare for statistical analysis, ML, and data manipulation questions.
                        </p>
                        <Link href="/sign-up" className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 cursor-pointer">
                            Get Started <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Business Strategy */}
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-orange-500/50 transition-all">
                        <Briefcase className="w-8 h-8 text-orange-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">Business Analyst</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Excel in business acumen, analysis, and stakeholder questions.
                        </p>
                        <Link href="/sign-up" className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1 cursor-pointer">
                            Get Started <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Advanced Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-r from-gray-900/50 to-gray-900/50 rounded-2xl border border-gray-800 my-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
                    Advanced Features Built for Success
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feature Set 1 */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Shield className="w-6 h-6 text-blue-400 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Real-time Analysis</h3>
                                <p className="text-gray-400">
                                    Get instant feedback on tone, pacing, confidence level, and answer structure as you practice.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Award className="w-6 h-6 text-green-400 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Certification Ready</h3>
                                <p className="text-gray-400">
                                    Get certificates upon completion of interview programs to showcase your preparation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Download className="w-6 h-6 text-purple-400 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Detailed Reports</h3>
                                <p className="text-gray-400">
                                    Download comprehensive PDF reports of your interview performance and improvement areas.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <MessageSquare className="w-6 h-6 text-orange-400 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Mentor Feedback</h3>
                                <p className="text-gray-400">
                                    Get human mentor reviews on challenging interviews for personalized coaching.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Lightning className="w-6 h-6 text-yellow-400 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Unlimited Attempts</h3>
                                <p className="text-gray-400">
                                    Practice unlimited interviews with different questions and difficulty levels.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-green-400 mt-1" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Progress Tracking</h3>
                                <p className="text-gray-400">
                                    Beautiful dashboards showing your improvement trajectory over weeks and months.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
                    Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                    Choose the plan that works best for your interview preparation journey.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Plan */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl flex flex-col">
                        <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                        <p className="text-gray-400 mb-6">Perfect for getting started</p>
                        <div className="text-4xl font-bold text-white mb-8">$0<span className="text-lg text-gray-400">/month</span></div>

                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>2 free interviews/month</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Basic feedback</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Limited question bank</span>
                            </li>
                        </ul>

                        <Link href="/sign-up">
                            <Button variant="outline" className="w-full cursor-pointer">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 bg-blue-500/10 border border-blue-500/30 rounded-xl flex flex-col ring-1 ring-blue-500/20">
                        <div className="mb-4">
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full">
                                MOST POPULAR
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                        <p className="text-gray-400 mb-6">Best for serious candidates</p>
                        <div className="text-4xl font-bold text-white mb-8">$29<span className="text-lg text-gray-400">/month</span></div>

                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Unlimited interviews</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Advanced AI feedback</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Full question bank</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Performance analytics</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>PDF reports</span>
                            </li>
                        </ul>

                        <Link href="/sign-up">
                            <Button className="w-full cursor-pointer">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>

                    {/* Premium Plan */}
                    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl flex flex-col">
                        <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                        <p className="text-gray-400 mb-6">For maximum success</p>
                        <div className="text-4xl font-bold text-white mb-8">$79<span className="text-lg text-gray-400">/month</span></div>

                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Everything in Pro</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>1-on-1 mentor sessions</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Priority support</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Custom question sets</span>
                            </li>
                            <li className="flex gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>Career coaching</span>
                            </li>
                        </ul>

                        <Link href="/sign-up">
                            <Button variant="outline" className="w-full cursor-pointer">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
                    Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-400 text-center mb-16">
                    Everything you need to know about PrepWise
                </p>

                <div className="space-y-4">
                    {/* FAQ 1 */}
                    <details className="group border border-gray-800 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-gray-700 transition-colors">
                        <summary className="flex items-center justify-between font-medium text-white cursor-pointer">
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                How accurate is the AI feedback?
                            </span>
                            <span className="transition group-open:rotate-180">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </summary>
                        <p className="text-gray-400 mt-4">
                            Our AI has been trained on thousands of real interviews and professional feedback. Studies show our feedback correlates 94% with professional interviewer assessments. The system evaluates your answer structure, confidence, clarity, and completeness.
                        </p>
                    </details>

                    {/* FAQ 2 */}
                    <details className="group border border-gray-800 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-gray-700 transition-colors">
                        <summary className="flex items-center justify-between font-medium text-white cursor-pointer">
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                Can I cancel anytime?
                            </span>
                            <span className="transition group-open:rotate-180">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </summary>
                        <p className="text-gray-400 mt-4">
                            Yes, absolutely. There are no lock-in contracts. You can cancel your subscription anytime from your account settings. No questions asked, no cancellation fees.
                        </p>
                    </details>

                    {/* FAQ 3 */}
                    <details className="group border border-gray-800 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-gray-700 transition-colors">
                        <summary className="flex items-center justify-between font-medium text-white cursor-pointer">
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                How many interviews should I do before real ones?
                            </span>
                            <span className="transition group-open:rotate-180">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </summary>
                        <p className="text-gray-400 mt-4">
                            We recommend at least 10-15 mock interviews with our system before your real interviews. Most users see significant improvement after 5-6 practice sessions. The key is consistency and applying feedback.
                        </p>
                    </details>

                    {/* FAQ 4 */}
                    <details className="group border border-gray-800 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-gray-700 transition-colors">
                        <summary className="flex items-center justify-between font-medium text-white cursor-pointer">
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                Is my data secure and private?
                            </span>
                            <span className="transition group-open:rotate-180">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </summary>
                        <p className="text-gray-400 mt-4">
                            Yes, we use enterprise-grade encryption (AES-256) for all data. We never share your personal information or interview recordings with third parties. All data is stored securely and you can request deletion anytime.
                        </p>
                    </details>

                    {/* FAQ 5 */}
                    <details className="group border border-gray-800 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-gray-700 transition-colors">
                        <summary className="flex items-center justify-between font-medium text-white cursor-pointer">
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                                What companies do your users get hired at?
                            </span>
                            <span className="transition group-open:rotate-180">
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </summary>
                        <p className="text-gray-400 mt-4">
                            Our users have gotten offers from FAANG companies (Facebook, Apple, Amazon, Netflix, Google), Microsoft, Tesla, Stripe, McKinsey, Goldman Sachs, and hundreds of other leading companies across all industries.
                        </p>
                    </details>
                </div>
            </section>

            {/* Learning Resources Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
                    Learning Resources
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Resource 1 */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
                        <div className="h-40 bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                            <Brain className="w-16 h-16 text-blue-400/50" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Interview Tips Guide</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Learn proven techniques used by top tier interview coaches and candidates.
                            </p>
                            <Link href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 cursor-pointer group">
                                Read Article <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition" />
                            </Link>
                        </div>
                    </div>

                    {/* Resource 2 */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all group">
                        <div className="h-40 bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                            <Award className="w-16 h-16 text-green-400/50" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-2">FAANG Preparation</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Specialized strategies and resources for getting offers from top tech companies.
                            </p>
                            <Link href="#" className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 cursor-pointer group">
                                Learn More <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition" />
                            </Link>
                        </div>
                    </div>

                    {/* Resource 3 */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
                        <div className="h-40 bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                            <TrendingUp className="w-16 h-16 text-purple-400/50" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Career Growth Hub</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Resources on salary negotiation, career transitions, and climbing the ladder.
                            </p>
                            <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 cursor-pointer group">
                                Explore <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials/Success Stories Section with Carousel */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
                    Success Stories from Real Users
                </h2>
                <p className="text-center text-gray-400 mb-16">
                    Join thousands of candidates who've transformed their interview skills
                </p>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Slide */}
                    <div className="relative overflow-hidden">
                        {testimonials.map((testimonial, index) => {
                            const colorClasses = getColorClasses(testimonial.color);
                            return (
                                <div
                                    key={testimonial.id}
                                    className={`transition-all duration-500 ease-in-out transform ${index === currentSlide
                                        ? "opacity-100 translate-x-0"
                                        : index < currentSlide
                                            ? "opacity-0 -translate-x-full absolute"
                                            : "opacity-0 translate-x-full absolute"
                                        }`}
                                >
                                    <div className="p-8 md:p-12 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-800 rounded-2xl">
                                        {/* Stars */}
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                                />
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                                            "{testimonial.quote}"
                                        </p>

                                        {/* User Info */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-14 h-14 ${colorClasses.bg} rounded-full flex items-center justify-center`}
                                            >
                                                <Users className={`w-7 h-7 ${colorClasses.icon}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-lg">
                                                    {testimonial.name}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {testimonial.title}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 w-full px-0 md:px-4 pointer-events-none">
                        <button
                            onClick={handlePrev}
                            className="pointer-events-auto p-2 rounded-full bg-gray-900/80 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all cursor-pointer -ml-16 md:-ml-20"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-300 hover:text-blue-400" />
                        </button>

                        <button
                            onClick={handleNext}
                            className="pointer-events-auto p-2 rounded-full bg-gray-900/80 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all cursor-pointer -mr-16 md:-mr-20"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-300 hover:text-blue-400" />
                        </button>
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex justify-center gap-2 mt-12">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all cursor-pointer ${index === currentSlide
                                    ? "bg-blue-500 w-8"
                                    : "bg-gray-700 w-2 hover:bg-gray-600"
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Ace Your Interview?
                </h2>
                <p className="text-xl text-gray-400 mb-12">
                    Join thousands of candidates who've successfully landed their dream jobs with PrepWise.
                </p>
                <Link href="/sign-up">
                    <Button size="lg" className="cursor-pointer gap-2">
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">No credit card required • Free trial included</p>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 bg-gray-950 mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/logo.svg" alt="logo" height={24} width={28} />
                                <span className="font-bold text-white">PrepWise</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Master your interview skills with AI-powered practice.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="#features" className="hover:text-white transition cursor-pointer">Features</Link></li>
                                <li><Link href="#pricing" className="hover:text-white transition cursor-pointer">Pricing</Link></li>
                                <li><Link href="#faq" className="hover:text-white transition cursor-pointer">FAQ</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/about" className="hover:text-white transition cursor-pointer">About</Link></li>
                                <li><Link href="/blog" className="hover:text-white transition cursor-pointer">Blog</Link></li>
                                <li><Link href="/careers" className="hover:text-white transition cursor-pointer">Careers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/privacy" className="hover:text-white transition cursor-pointer">Privacy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition cursor-pointer">Terms</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition cursor-pointer">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <p className="text-gray-400 text-sm text-center">
                            © 2024 PrepWise. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
