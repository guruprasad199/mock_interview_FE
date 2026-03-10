import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageViewTracker } from "@/components/PageViewTracker";

export default function Terms() {
    return (
        <>
            <PageViewTracker pageName="terms" pageTitle="Terms of Service" />
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
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-gray-400 mb-12">Last updated: March 2024</p>

                    <div className="prose prose-invert max-w-none space-y-8">
                        {/* Section 1 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-300 leading-relaxed">
                                By accessing and using the PrepWise website and application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                Permission is granted to temporarily download one copy of the materials (information or software) on PrepWise's service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>Modify or copy the materials</li>
                                <li>Use the materials for any commercial purpose or for any public display</li>
                                <li>Attempt to decompile or reverse engineer any software contained on PrepWise</li>
                                <li>Remove any copyright or other proprietary notations from the materials</li>
                                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
                            <p className="text-gray-300 leading-relaxed">
                                The materials on PrepWise are provided on an 'as is' basis. PrepWise makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                            <p className="text-gray-300 leading-relaxed">
                                In no event shall PrepWise or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PrepWise, even if PrepWise or an authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Materials</h2>
                            <p className="text-gray-300 leading-relaxed">
                                The materials appearing on PrepWise could include technical, typographical, or photographic errors. PrepWise does not warrant that any of the materials on its service are accurate, complete, or current. PrepWise may make changes to the materials contained on its service at any time without notice.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">6. User Account & Passwords</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                When you create an account on PrepWise, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account. You agree to notify PrepWise immediately of any unauthorized use of your account or any other breach of security.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Subscription & Billing</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                Paid subscriptions to PrepWise automatically renew on the billing cycle you've chosen. You authorize us to charge your payment method on each renewal date. You can cancel your subscription at any time from your account settings.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Refund Policy</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with PrepWise, contact us for a full refund within 30 days of purchase. Refunds are not available after this 30-day window.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">9. User-Generated Content</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                By submitting content to PrepWise (including interview responses, resumes, and feedback), you grant PrepWise a non-exclusive, worldwide, royalty-free license to use this content to improve our service and AI models. Your personal data will never be shared with third parties without your consent.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Prohibited Conduct</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                You agree not to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>Engage in any form of harassment or abuse</li>
                                <li>Upload viruses or malicious code</li>
                                <li>Attempt to gain unauthorized access</li>
                                <li>Use the service to cheat or engage in academic dishonesty</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
                            <p className="text-gray-300 leading-relaxed">
                                PrepWise reserves the right to terminate your account and access to the service at any time, for any reason, including violation of these terms. Upon termination, you lose the right to use the service.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                If you have any questions about these Terms of Service, please contact us at:
                            </p>
                            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                                <p className="text-white"><strong>Email:</strong> support@prepwise.com</p>
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
