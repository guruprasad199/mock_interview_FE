import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { PageViewTracker } from "@/components/PageViewTracker";

export default function Contact() {
    return (
        <>
            <PageViewTracker pageName="contact" pageTitle="Contact Us" />
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
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Get in Touch</h1>
                    <p className="text-xl text-gray-400">
                        Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </section>

                {/* Contact Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* Email */}
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center hover:border-blue-500/50 transition-all">
                            <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Email</h3>
                            <p className="text-gray-400 mb-4">Send us an email anytime</p>
                            <Link href="mailto:support@prepwise.com" className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                                support@prepwise.com
                            </Link>
                            <p className="text-gray-500 text-sm mt-2">We typically respond within 24 hours</p>
                        </div>

                        {/* Phone */}
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center hover:border-green-500/50 transition-all">
                            <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Phone</h3>
                            <p className="text-gray-400 mb-4">Call us during business hours</p>
                            <a href="tel:+14155551234" className="text-green-400 hover:text-green-300 font-semibold cursor-pointer">
                                +1 (415) 555-1234
                            </a>
                            <p className="text-gray-500 text-sm mt-2">Monday - Friday, 9am - 5pm PT</p>
                        </div>

                        {/* Address */}
                        <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-xl text-center hover:border-purple-500/50 transition-all">
                            <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Address</h3>
                            <p className="text-gray-400 mb-4">Visit us in person</p>
                            <p className="text-purple-400 font-semibold">
                                123 Tech Street<br />
                                San Francisco, CA 94103<br />
                                United States
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Send us a Message</h2>

                        <form className="space-y-6 p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
                            {/* Name */}
                            <div>
                                <label className="block text-white font-medium mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                                    placeholder="Your name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-white font-medium mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                                    placeholder="your@email.com"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-white font-medium mb-2">Subject *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                                    placeholder="How can we help?"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-white font-medium mb-2">Message *</label>
                                <textarea
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" size="lg" className="w-full cursor-pointer">
                                Send Message
                            </Button>

                            <p className="text-gray-500 text-sm text-center">
                                We'll get back to you as soon as possible. Thank you for reaching out!
                            </p>
                        </form>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Common Questions</h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: "What's the best way to contact support?",
                                a: "For urgent issues, please email support@prepwise.com or call us during business hours. For sales inquiries, you can reach our sales@prepwise.com."
                            },
                            {
                                q: "How long does it take to get a response?",
                                a: "We aim to respond to all inquiries within 24 business hours. For urgent matters, please mention this in your message."
                            },
                            {
                                q: "Do you have a community forum?",
                                a: "Yes! Join our community at community.prepwise.com to connect with other users, share tips, and get support from the community."
                            },
                            {
                                q: "Can I schedule a call with the team?",
                                a: "Absolutely! For Demo requests or partnership inquiries, please email partnerships@prepwise.com and we'll schedule a time that works for you."
                            }
                        ].map((item, index) => (
                            <details
                                key={index}
                                className="group border border-gray-800 rounded-lg p-6 cursor-pointer hover:border-gray-700 transition-colors"
                            >
                                <summary className="flex items-center justify-between font-medium text-white cursor-pointer">
                                    <span>{item.q}</span>
                                    <span className="transition group-open:rotate-180">→</span>
                                </summary>
                                <p className="text-gray-400 mt-4">{item.a}</p>
                            </details>
                        ))}
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
