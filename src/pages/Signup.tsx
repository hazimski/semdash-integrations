import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { UserPlus, Mail, ArrowRight, CheckCircle, Chrome } from 'lucide-react';
import { supabase } from '../config/supabase';
import { resendActivationEmail } from '../services/auth';

const testimonials = [
  {
    name: "Adam Bash",
    role: "SEO Manager",
    company: "TechCorp",
    image: "https://famyayvemq6ogs8n.public.blob.vercel-storage.com/avatars/32qlrgbhvu81-5cgQt2d0YZUnvIE5siw5MdPKcl11I9.jpg",
    content: "SemDash has a very robust suite of SEO tools that are very useful for anyone trying to get a better grasp of their website's SEO"
  },
  {
    name: "Michael Chen",
    role: "Digital Marketing Director",
    company: "GrowthLabs",
    image: "https://famyayvemq6ogs8n.public.blob.vercel-storage.com/avatars/mgqfv6in8lm8-vhNDdCoVBgptzlJfgUPdkYng5YFKdv.jpg",
    content: "The best SEO tool I've used. It's comprehensive yet intuitive."
  },
  {
    name: "Emily Davis",
    role: "Content Strategist",
    company: "ContentPro",
    image: "https://famyayvemq6ogs8n.public.blob.vercel-storage.com/avatars/oz2b01rcteun-Zf5dV8FcMkyIe2ajkjlYeK404BaWHl.jpg",
    content: "Game-changing keyword research capabilities. Highly recommended!"
  }
];

const features = [
  { title: "Advanced Keyword Research", description: "Discover high-value keywords with comprehensive metrics" },
  { title: "Competitor Analysis", description: "Track and analyze your competitors' SEO strategies" },
  { title: "Backlink Monitoring", description: "Monitor and analyze your backlink profile" },
  { title: "SERP Checker", description: "Check whats ranking in Google for any keyword anytime" }
];

export function Signup() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const referralCode = searchParams.get('ref');

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/overview`,
          queryParams: referralCode ? {
            referral_code: referralCode
          } : undefined
        }
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error('Failed to sign up with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResendActivation = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      await resendActivationEmail(email);
      toast.success('Activation email resent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend activation email.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);

    try {
      await signup(email, password);
      
      if (referralCode) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ referred_by: referralCode })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating referral:', updateError);
        }
      }

      toast.success('Check your inbox & Confirm your email!');
      setShowResend(true);
      navigate('/login');
    } catch (error) {
      toast.error('Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Sign Up Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 order-2 lg:order-1">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Get Started with SemDash
                </h2>
                {referralCode && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      2,000 bonus credits from referral!
                    </p>
                  </div>
                )}
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <Chrome className="w-5 h-5 mr-2" />
                  {isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}
                </button>

                <div className="text-center">
                  <Link 
                    to="/login"
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Already have an account? Sign in
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                {showResend && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendActivation}
                      disabled={resending}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {resending ? 'Sending...' : 'Resend activation email'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Features & Testimonials */}
          <div className="order-1 lg:order-2 space-y-12">
            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm italic">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
