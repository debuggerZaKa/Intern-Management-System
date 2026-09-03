import React from "react";

function formatCertificateDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function CertificateDocument({ internData }) {
  if (!internData) return null;

  const intern = internData.intern || internData;
  const fullName = intern?.profile?.full_name || intern?.email?.split("@")[0] || "Intern Candidate";
  const gender = intern?.profile?.gender?.toLowerCase();
  const honorific = gender === "female" ? "Ms." : gender === "male" ? "Mr." : "Mr./Ms.";
  const pronounSubject = gender === "female" ? "she" : gender === "male" ? "he" : "they";
  const pronounObject = gender === "female" ? "her" : gender === "male" ? "him" : "them";
  const pronounPossessive = gender === "female" ? "her" : gender === "male" ? "his" : "their";

  const department = internData.department || intern?.profile?.department || "Professional Services";
  const roleTitle = internData.role_title || `${department} Engineer` || "Full-stack Engineer";
  const startDateFormatted = formatCertificateDate(internData.start_date || "2024-06-12");
  const endDateFormatted = formatCertificateDate(internData.end_date || "2024-07-23");
  const issueDateFormatted = formatCertificateDate(internData.certificate_issued_at || internData.end_date || new Date());

  return (
    <div className="w-full max-w-[800px] min-h-[1080px] mx-auto bg-white p-10 sm:p-14 md:p-16 flex flex-col justify-between relative font-sans text-slate-900 select-text print:p-8 print:m-0 print:w-full print:max-w-none print:min-h-screen">
      
      {/* Top Section */}
      <div className="space-y-10">
        
        {/* 1. Header: Logo (Left) and NETSOL Company Address (Right) */}
        <div className="flex items-start justify-between gap-6">
          {/* Left: NETSOL Logo */}
          <div className="flex flex-col items-start">
            <img
              src="/netsol_logo.png"
              alt="NETSOL"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          {/* Right: Company Information Letterhead */}
          <div className="text-right text-[11px] sm:text-xs text-slate-800 leading-tight space-y-0.5 font-medium max-w-[280px]">
            <h4 className="font-extrabold text-slate-950 text-xs sm:text-sm">NETSOL Technologies Ltd.</h4>
            <p className="text-slate-700">NETSOL IT Village (Software Technology Park), Lahore Ring Road,</p>
            <p className="text-slate-700">Ghazi Road Interchange, Lahore</p>
            <p className="text-slate-700">Cantt. 54792, Pakistan</p>
            <p className="text-slate-700 pt-0.5">Email: info@netsoltech.com</p>
            <p className="text-slate-700">Phone: +92 42 111 44 88 00</p>
            <p className="text-slate-700">Web: www.netsoltech.com</p>
          </div>
        </div>

        {/* 2. Issue Date (Left Aligned) */}
        <div className="pt-2">
          <p className="text-xs sm:text-sm font-medium text-slate-900">
            {issueDateFormatted}
          </p>
        </div>

        {/* 3. Title: Centered, Bold, Underlined */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-wide underline underline-offset-4 decoration-2 uppercase">
            CERTIFICATE OF INTERNSHIP
          </h1>
        </div>

        {/* 4. Body Paragraphs */}
        <div className="space-y-6 text-xs sm:text-[14px] text-slate-800 leading-relaxed sm:leading-[1.8] text-justify font-normal pt-2">
          <p>
            This is to certify that <strong className="font-bold text-slate-950">{honorific} {fullName}</strong> has worked with our company as an Intern from <strong className="font-bold text-slate-950">{startDateFormatted}</strong> to <strong className="font-bold text-slate-950">{endDateFormatted}</strong> in our <strong className="font-bold text-slate-950">{department}</strong> department as a <strong className="font-bold text-slate-950">{roleTitle}</strong>.
          </p>

          <p>
            During the period {pronounSubject} worked with the company, we found {pronounObject} to be hardworking and sincere resource. We wish {pronounObject} all the best in {pronounPossessive} future professional endeavors.
          </p>
        </div>

        {/* 5. Stamp & Signature Block */}
        <div className="pt-14 pb-4 relative">
          
          {/* Circular NETSOL Ink Stamp (Smooth 360° circular perimeter text) */}
          <div className="absolute left-28 sm:left-36 -top-2 transform -rotate-[26deg] select-none pointer-events-none opacity-95 z-0">
            <svg width="146" height="146" viewBox="0 0 160 160" className="text-[#1034a6]">
              {/* Outer Double Rings */}
              <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="3.2" />
              <circle cx="80" cy="80" r="69" fill="none" stroke="currentColor" strokeWidth="1.4" />
              
              {/* Inner Circle Separator */}
              <circle cx="80" cy="80" r="47" fill="none" stroke="currentColor" strokeWidth="1.8" />

              {/* Exact Circular Arc Path for Outer Text */}
              <path
                id="stampPerimeterPathCircular"
                d="M 52,130 A 58,58 0 1,1 108,130"
                fill="none"
              />
              
              {/* Perimeter Text (Smoothly curved round the circle without cutoff) */}
              <text fontSize="7.4" fontWeight="bold" fill="currentColor" stroke="currentColor" strokeWidth="0.25" textLength="280" lengthAdjust="spacing">
                <textPath href="#stampPerimeterPathCircular" startOffset="50%" textAnchor="middle">
                  NetSol IT Village (Software Technology Park) Ghazi Road Lahore Cantt
                </textPath>
              </text>

              {/* Center Box Text */}
              <text x="80" y="65" textAnchor="middle" fontSize="13.5" fontWeight="bold" fill="currentColor" stroke="currentColor" strokeWidth="0.4" letterSpacing="0.2">
                NetSol
              </text>
              <text x="80" y="80" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="currentColor" stroke="currentColor" strokeWidth="0.4" letterSpacing="0.1">
                Technologies
              </text>
              <text x="80" y="94" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="currentColor" stroke="currentColor" strokeWidth="0.4" letterSpacing="0.1">
                Limited
              </text>

              {/* Bottom Centered Solid Star */}
              <text x="80" y="142" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">
                ★
              </text>
            </svg>
          </div>

          {/* Cursive Pen Signature */}
          <div className="relative z-10 w-28 -mb-1 select-none pointer-events-none">
            <svg width="85" height="52" viewBox="0 0 100 60" fill="none" className="text-slate-900">
              {/* Cursive strokes for Uzma */}
              <path
                d="M 12 25 Q 16 18, 20 25 Q 23 35, 20 48 Q 18 55, 22 52 Q 26 48, 28 32 Q 32 20, 36 30 Q 40 40, 46 22 Q 52 5, 54 18 Q 56 32, 65 30"
                stroke="#1e293b"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Small top hook above first letter */}
              <path
                d="M 10 18 C 12 14, 16 14, 18 18"
                stroke="#1e293b"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Underline stroke */}
              <path
                d="M 52 42 L 68 34"
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Signee Designation */}
          <div className="relative z-10 text-left text-xs sm:text-[13px] leading-snug space-y-0.5">
            <p className="font-extrabold text-slate-950">Uzma Imtiaz</p>
            <p className="font-medium text-slate-700">Lead Talent Acquisition,</p>
            <p className="font-medium text-slate-700">NETSOL Technologies Inc.</p>
          </div>

        </div>

      </div>

      {/* 6. Footer: Blue Divider Stripe & Global Office Locations */}
      <div className="pt-12 mt-auto">
        {/* Thin Blue Accent Line */}
        <div className="w-full h-[2.5px] bg-blue-500 mb-3" />

        {/* Global City Locations with Dots */}
        <div className="flex flex-wrap items-center justify-between gap-y-1 text-[9px] sm:text-[10px] font-semibold text-slate-700">
          <span className="text-center"><strong>Lahore</strong><br/><span className="text-slate-500 text-[8px]">Pakistan</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Karachi</strong><br/><span className="text-slate-500 text-[8px]">Pakistan</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Islamabad</strong><br/><span className="text-slate-500 text-[8px]">Pakistan</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Horsham</strong><br/><span className="text-slate-500 text-[8px]">UK</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Sydney</strong><br/><span className="text-slate-500 text-[8px]">Australia</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Beijing</strong><br/><span className="text-slate-500 text-[8px]">China</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Shanghai</strong><br/><span className="text-slate-500 text-[8px]">China</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Bangkok</strong><br/><span className="text-slate-500 text-[8px]">Thailand</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Jakarta</strong><br/><span className="text-slate-500 text-[8px]">Indonesia</span></span>
          <span className="text-blue-500 font-bold">•</span>
          <span className="text-center"><strong>Calabasas</strong><br/><span className="text-slate-500 text-[8px]">USA</span></span>
        </div>
      </div>

    </div>
  );
}
