import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageViewTracker } from "@/components/PageViewTracker";

export default function Privacy() {
    return (
        <>
            <PageViewTracker pageName="privacy" pageTitle="Privacy Policy" />
            <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
                {/* Back Button */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/">
                        <Button variant="ghost" className="cursor-pointer gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-gray-400 mb-12">Last updated: March 2024</p>

                    <div className="prose prose-invert max-w-none space-y-8">
                        {/* Section 1 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p className="text-gray-300 leading-relaxed">
                                PrepWise ("we," "us," "our," or "Company") operates the PrepWise website and mobile application (collectively, the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Information Collection and Use</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                We collect several different types of information for various purposes to provide and improve our Service to you.
                            </p>
                            <h3 className="text-xl font-semibold text-white mb-3">Types of Data Collected:</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
                                <li><strong>Personal Data:</strong> Name, email address, phone number, resume, and interview recordings</li>
                                <li><strong>Usage Data:</strong> Information about how you use the Service (pages visited, time spent, features used)</li>
                                <li><strong>Device Information:</strong> Browser type, IP address, operating system, and device identifiers</li>
                                <li><strong>Payment Information:</strong> Encrypted payment details (never stored directly by us)</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Use of Data</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                PrepWise uses the collected data for various purposes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>To provide and maintain our Service</li>
                                <li>To provide customer support and respond to your requests</li>
                                <li>To track usage patterns and improve our Service</li>
                                <li>To send promotional communications (with your consent)</li>
                                <li>To detect, prevent, and address fraud and security issues</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                            <p className="text-gray-300 leading-relaxed">
                                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. We use AES-256 encryption for all sensitive data, including personal information and interview recordings. However, we cannot guarantee absolute security.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                            <p className="text-gray-300 leading-relaxed">
                                PrepWise will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use Personal Data to the extent necessary to comply with our legal obligations. You can request deletion of your data at any time by contacting us at privacy@prepwise.com.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                Depending on your location, you may have the following rights:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>Right to access your personal data</li>
                                <li>Right to correct inaccurate data</li>
                                <li>Right to request deletion of your data</li>
                                <li>Right to opt-out of marketing communications</li>
                                <li>Right to data portability</li>
                                <li>Right to withdraw consent</li>
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We use cookies to enhance your experience on our Service. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. If you do not accept our cookies, you may experience reduced functionality of our Service.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                                <p className="text-white"><strong>Email:</strong> privacy@prepwise.com</p>
                                <p className="text-white mt-2"><strong>Address:</strong> PrepWise Inc., San Francisco, CA, USA</p>
                            </div>
                        </div>
                    </div>
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
