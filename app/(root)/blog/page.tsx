import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { PageViewTracker } from "@/components/PageViewTracker";

export default function Blog() {
    const articles = [
        {
            id: 1,
            title: "10 Proven Strategies to Ace Your Next Tech Interview",
            excerpt: "Learn the techniques used by top candidates to land offers at FAANG companies. We break down system design, behavioral questions, and coding challenges.",
            author: "Sarah Chen",
            date: "March 8, 2024",
            image: "bg-blue-500/20",
            category: "Career Tips"
        },
        {
            id: 2,
            title: "How AI is Revolutionizing Interview Preparation",
            excerpt: "Discover how artificial intelligence is changing the way candidates prepare for interviews and what that means for your job search strategy.",
            author: "Marcus Reid",
            date: "March 5, 2024",
            image: "bg-purple-500/20",
            category: "Industry News"
        },
        {
            id: 3,
            title: "The Complete Guide to Behavioral Interviews (STAR Method)",
            excerpt: "Master the STAR method and learn how to tell compelling stories that showcase your experiences and problem-solving abilities.",
            author: "Alex Thompson",
            date: "March 1, 2024",
            image: "bg-green-500/20",
            category: "Interview Guide"
        },
        {
            id: 4,
            title: "Salary Negotiation 101: How to Get What You Deserve",
            excerpt: "A comprehensive guide on negotiating your salary, benefits, and perks after receiving an offer. Real examples and templates included.",
            author: "Jessica Lee",
            date: "February 26, 2024",
            image: "bg-orange-500/20",
            category: "Salary Guide"
        },
        {
            id: 5,
            title: "Career Transitions: From Finance to Tech in 6 Months",
            excerpt: "Read our interview with Michael Chen, who successfully transitioned from finance to tech. Learn his strategies and tips for a smooth career change.",
            author: "Aisha Patel",
            date: "February 22, 2024",
            image: "bg-red-500/20",
            category: "Success Stories"
        },
        {
            id: 6,
            title: "The Importance of Mock Interviews in Your Preparation",
            excerpt: "Explore why mock interviews are crucial for interview success and how to make the most of your practice sessions.",
            author: "David Kumar",
            date: "February 18, 2024",
            image: "bg-indigo-500/20",
            category: "Career Tips"
        }
    ];

    return (
        <>
            <PageViewTracker pageName="blog" pageTitle="Blog" />
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
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        PrepWise <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Blog</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Interview preparation tips, career advice, and success stories from candidates who've landed their dream jobs.
                    </p>
                </section>

                {/* Articles Grid */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <article
                                key={article.id}
                                className="group bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                {/* Article Image */}
                                <div className={`h-48 ${article.image} flex items-center justify-center`}></div>

                                {/* Article Content */}
                                <div className="p-6">
                                    {/* Category Badge */}
                                    <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full mb-4">
                                        {article.category}
                                    </span>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition line-clamp-2">
                                        {article.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                        {article.excerpt}
                                    </p>

                                    {/* Meta Information */}
                                    <div className="space-y-3 border-t border-gray-800 pt-4">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <User className="w-4 h-4" />
                                            <span>{article.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{article.date}</span>
                                        </div>
                                    </div>

                                    {/* Read More Link */}
                                    <Link href={`/blog/${article.id}`} className="mt-6 inline-block">
                                        <Button variant="outline" size="sm" className="cursor-pointer">
                                            Read Article
                                        </Button>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
                        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                            Subscribe to our newsletter and get the latest interview tips, career advice, and success stories delivered to your inbox every week.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                            />
                            <Button type="submit" className="cursor-pointer whitespace-nowrap">
                                Subscribe
                            </Button>
                        </form>

                        <p className="text-gray-500 text-sm mt-4">
                            No spam, just quality content. Unsubscribe anytime.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to Ace Your Interviews?</h2>
                    <p className="text-gray-400 mb-8">
                        Learn these strategies hands-on with PrepWise's AI-powered interview preparation platform.
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
