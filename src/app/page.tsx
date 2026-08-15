'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Building2,
  Stethoscope,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Pill,
  Star,
  Activity,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-sky-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200/70 text-sky-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Healthcare, simplified.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Your healthcare journey,{' '}
              <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 bg-clip-text text-transparent">
                connected.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Scan prescriptions, find medicines, compare pharmacy availability, and connect with healthcare professionals — all from one place.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/prescriptions/scan"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 hover:scale-[1.02] transition-all"
                id="hero-scan-cta"
              >
                <FileText className="w-4 h-4" />
                Scan Prescription
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/medicines"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-all"
                id="hero-find-medicines-cta"
              >
                <Search className="w-4 h-4 text-sky-600" />
                Find Medicines
              </Link>
            </div>

            {/* Key Micro-Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Price Markups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Inventory Queries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Physicians</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols) — Sophisticated Layered Product Preview */}
          <div className="lg:col-span-5 relative">
            {/* Ambient Backing Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-sky-400/20 via-indigo-400/20 to-teal-400/10 rounded-3xl blur-2xl -z-10"></div>

            {/* Main Interactive Product Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-4">
              {/* Header inside Mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none">Live Healthcare Hub</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      All Systems Synced
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Verified Patient
                </span>
              </div>

              {/* Layer 1: Floating Prescription OCR Recognition Card */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-2xl p-3.5 border border-sky-200/70 space-y-2 hover-card-elevation">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Digital Rx Recognized</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    100% OCR Match
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white rounded-xl p-2.5 border border-sky-100 shadow-xs">
                  <div>
                    <p className="font-bold text-slate-900">Amoxicillin 500mg</p>
                    <p className="text-[10px] text-slate-500">1 Capsule • Twice daily • 7 Days</p>
                  </div>
                  <span className="font-extrabold text-slate-900 text-xs">$12.50</span>
                </div>
              </div>

              {/* Layer 2: Floating Pharmacy Availability Match Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2 hover-card-elevation">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span>City Care Pharmacy</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    In Stock (150 units)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    4.9 (1,240 reviews)
                  </span>
                  <span>1.2 km • 25 min delivery</span>
                </div>
              </div>

              {/* Layer 3: Order Status Live Tracker Pill */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between hover-card-elevation">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Order #MC-2026-890</p>
                    <p className="text-[10px] text-slate-400">Out for Doorstep Delivery</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500 text-slate-950 rounded-lg">
                  ETA 18m
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST INDICATORS SECTION */}
      <section className="py-10 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-center gap-3.5 p-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">HIPAA & ISO 27001</p>
                <p className="text-xs text-slate-500">Bank-grade 256-bit encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">99.8% OCR Precision</p>
                <p className="text-xs text-slate-500">Automated medicine extraction</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">500+ Pharmacies</p>
                <p className="text-xs text-slate-500">Real-time local inventory</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900">Certified Specialists</p>
                <p className="text-xs text-slate-500">Online & in-person consultations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW MEDCENTRE WORKS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Simple & Intelligent Workflow</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              How MedCentre Streamlines Healthcare
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From uploading your prescription to doorstep fulfillment and specialist consultation in three transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative space-y-4 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Scan or Upload Prescription</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take a photo or upload a PDF of your doctor’s prescription. Our clinical OCR system accurately parses medications, dosages, and durations.
              </p>
              <Link href="/prescriptions/scan" className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 pt-2">
                Try Scanner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative space-y-4 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Compare Local Stock & Price</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We query real-time medicine batches across nearby pharmacies so you can compare pricing, availability, and delivery times instantly.
              </p>
              <Link href="/pharmacy/availability" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2">
                Check Availability <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative space-y-4 hover-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">Doorstep Delivery & Care</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Place orders transactionally, track live status milestones, set daily dose reminders, and store records in your encrypted health vault.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2">
                View Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SHOWCASE GRID */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Enterprise Healthcare Features</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              Integrated Tools Built for Modern Health
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything you need to manage your personal health ecosystem in one streamlined, intuitive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover-card-elevation">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Prescription OCR Scanner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Turn handwritten or digital prescriptions into structured, actionable medication items in seconds.
              </p>
              <Link href="/prescriptions/scan" className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 pt-1">
                Scan Prescription →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover-card-elevation">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Master Medicine Database</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse authentic pharmaceutical products with detailed composition, dosage guidelines, and Rx rules.
              </p>
              <Link href="/medicines" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 pt-1">
                Explore Medicines →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover-card-elevation">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Pharmacy Inventory Matrix</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check exact batch numbers, expiration dates, prices, and stock counts before placing an order.
              </p>
              <Link href="/pharmacy/availability" className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 pt-1">
                Find Pharmacies →
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover-card-elevation">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Specialist Consultations</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Book teleconsultation or in-clinic visits with certified physicians across clinical specialities.
              </p>
              <Link href="/doctors" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-1">
                Book Doctors →
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover-card-elevation">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Health Records Vault</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organize lab reports, digital prescriptions, and doctor visit histories in an end-to-end encrypted vault.
              </p>
              <Link href="/health-records" className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 pt-1">
                Access Vault →
              </Link>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover-card-elevation">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Medication Reminders</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stay consistent with personalized dose schedules, adherence compliance tracking, and snooze alerts.
              </p>
              <Link href="/reminders" className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 pt-1">
                Set Reminders →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-sky-200 border border-white/20">
            Get Started in Seconds
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ready to experience effortless, intelligent healthcare?
          </h2>
          <p className="text-sm sm:text-base text-sky-200 max-w-xl mx-auto">
            Join thousands of patients and clinical providers managing prescriptions, medicines, and appointments on MedCentre.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-xl hover:bg-sky-50 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/medicines"
              className="px-8 py-4 rounded-2xl bg-white/10 text-white font-extrabold text-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
