import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Briefcase, Users } from "lucide-react";
import { CareersPageTracker } from "@/components/PageViewTracker";

export default function Careers() {
    const positions = [
        {
            title: "Senior Full Stack Engineer",
            location: "San Francisco, CA",
            type: "Full-time",
            department: "Engineering",
            description: "Help us build and scale our AI-powered platform. Experience with React, Node.js, and cloud infrastructure required."
        },
        {
            title: "AI/ML Engineer",
            location: "Remote",
            type: "Full-time",
            department: "AI Research",
            description: "Build and improve our AI interview engine. Experience with NLP, transformers, and conversational AI required."
        },
        {
            title: "Product Manager",
            location: "San Francisco, CA",
            type: "Full-time",
            department: "Product",
            description: "Drive product strategy for our interview preparation platform. Experience with education/SaaS products preferred."
        },
        {
            title: "Interview Coach",
            location: "Remote",
            type: "Part-time / Full-time",
            department: "Support",
            description: "Provide feedback to candidates and help refine our coaching library. 5+ years of interview experience required."
        },
        {
            title: "Marketing Manager",
            location: "San Francisco, CA",
            type: "Full-time",
            department: "Marketing",
            description: "Lead growth initiatives for PrepWise. Experience with product marketing and SaaS growth required."
        },
        {
            title: "Customer Success Manager",
            location: "Remote",
            type: "Full-time",
            department: "Customer Success",
            description: "Build strong relationships with our customers and ensure their success. Excellent communication skills required."
        }
    ];

    return (
        <>
            <CareersPageTracker />
            <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
                {/* Back Button */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/">
                        <Button variant="ghost" className="cursor-pointer gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Join the PrepWise <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Team</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                        We're building the future of interview preparation. Help us transform how people prepare for their dream jobs.
                    </p>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                        At PrepWise, we believe that great talent deserves great opportunities. If you're passionate about education, AI, and making a real impact, we'd love to hear from you.
                    </p>
                </section>

                {/* Culture Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Join PrepWise?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
                            <Users className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">World-Class Team</h3>
                            <p className="text-gray-400">
                                Work alongside talented engineers, researchers, and product leaders from top tech companies and academia.
                            </p>
                        </div>

                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
                            <Briefcase className="w-8 h-8 text-green-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Impact & Growth</h3>
                            <p className="text-gray-400">
                                Your work directly impacts thousands of candidates landing their dream jobs. Grow alongside a fast-growing company.
                            </p>
                        </div>

                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
                            <MapPin className="w-8 h-8 text-purple-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Flexibility</h3>
                            <p className="text-gray-400">
                                Remote-friendly roles, flexible hours, and a work-life balance that actually works. Competitive compensation too.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Openings Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Open Positions</h2>

                    <div className="grid grid-cols-1 gap-6">
                        {positions.map((position, index) => (
                            <div
                                key={index}
                                className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-3">{position.title}</h3>
                                        <p className="text-gray-300 mb-4">{position.description}</p>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <MapPin className="w-4 h-4" />
                                                <span>{position.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{position.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Users className="w-4 h-4" />
                                                <span>{position.department}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href="/sign-in?tab=careers">
                                        <Button className="cursor-pointer whitespace-nowrap">
                                            Apply Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">What We Offer</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            "Competitive salary & equity",
                            "Comprehensive health insurance",
                            "Unlimited PTO policy",
                            "Remote work flexibility",
                            "Professional development budget",
                            "Learning stipend",
                            "Home office stipend",
                            "Mental health support",
                            "Team events & retreats",
                            "Parental leave",
                            "401(k) matching",
                            "Free PrepWise premium access"
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-300">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Don't see your fit?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        If you're passionate about our mission and believe you can make an impact, we'd love to hear from you anyway.
                    </p>
                    <Link href="mailto:careers@prepwise.com">
                        <Button size="lg" variant="outline" className="cursor-pointer">
                            Send us your resume
                        </Button>
                    </Link>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-800 mt-24 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
                        <p>© 2024 PrepWise. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
