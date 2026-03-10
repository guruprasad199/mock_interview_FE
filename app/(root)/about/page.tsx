import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Users, Lightbulb, Award } from "lucide-react";
import { AboutPageTracker } from "@/components/PageViewTracker";

export default function About() {
    return (
        <>
            <AboutPageTracker />
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
                        About <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">PrepWise</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                        We're on a mission to democratize interview preparation and help millions of candidates land their dream jobs with confidence.
                    </p>
                </section>

                {/* Mission Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
                            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                                PrepWise was founded with a simple belief: everyone deserves access to world-class interview preparation, regardless of their background or location.
                            </p>
                            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                                We combine cutting-edge AI technology with proven interview coaching techniques to create a platform that genuinely helps candidates succeed. Our AI interviewer isn't just a tool—it's your personal coach, available 24/7.
                            </p>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Since our launch, we've helped over 50,000 candidates land roles at leading companies worldwide, with an 85% success rate.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8">
                            <Image
                                src="/robot.png"
                                alt="PrepWise AI"
                                width={400}
                                height={400}
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Our Values</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Value 1 */}
                        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all">
                            <Target className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-3">Excellence</h3>
                            <p className="text-gray-400">
                                We're committed to providing the highest quality service and continuously improving our platform.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-green-500/50 transition-all">
                            <Users className="w-8 h-8 text-green-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-3">Accessibility</h3>
                            <p className="text-gray-400">
                                We believe interview prep should be accessible to everyone, not just those who can afford expensive coaches.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all">
                            <Lightbulb className="w-8 h-8 text-purple-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-3">Innovation</h3>
                            <p className="text-gray-400">
                                We leverage the latest AI and machine learning to create interview experiences that feel real and actionable.
                            </p>
                        </div>

                        {/* Value 4 */}
                        <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-orange-500/50 transition-all">
                            <Award className="w-8 h-8 text-orange-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-3">Results</h3>
                            <p className="text-gray-400">
                                Our success is measured by our users' success. We're obsessed with helping you land your dream role.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-4xl font-bold text-white mb-12 text-center">Meet Our Team</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Team Member 1 */}
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
                            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-12 h-12 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Aisha Patel</h3>
                            <p className="text-gray-400 mb-4">CEO & Co-founder</p>
                            <p className="text-gray-300 text-sm">
                                Former Google recruiter with 8+ years of experience in tech hiring. Passionate about leveling the playing field for candidates.
                            </p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-12 h-12 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Marcus Reid</h3>
                            <p className="text-gray-400 mb-4">CTO & Co-founder</p>
                            <p className="text-gray-300 text-sm">
                                AI researcher from MIT with expertise in NLP and conversational AI. Built PrepWise's intelligent interview engine.
                            </p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
                            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-12 h-12 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Sarah Chen</h3>
                            <p className="text-gray-400 mb-4">Head of Product</p>
                            <p className="text-gray-300 text-sm">
                                Ex-Amazon product manager. Focuses on making PrepWise intuitive and incredibly effective for all user levels.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Interview Skills?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Join thousands of successful candidates who've used PrepWise to land their dream jobs.
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" className="cursor-pointer">
                            Start Your Free Trial
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