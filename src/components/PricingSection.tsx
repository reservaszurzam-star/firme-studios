import React from 'react';
import { PRICING_PLANS } from '../data/mockData';
import { Check, Sparkles } from 'lucide-react';
import { PricingPlan } from '../types';

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <section
      id="membresias"
      className="w-full bg-[#F1ECE5] py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A] block mb-2">
            Planes y Membresías
          </span>
          <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
            Compromiso con tu bienestar
          </h2>
          <p className="mt-3 text-[#6B655C] text-sm sm:text-base leading-relaxed">
            Sin matrícula oculta. Elige la modalidad que mejor encaje con tu ritmo de vida y regularidad de práctica.
          </p>
        </div>

        {/* 4 Pricing Cards Grid (desktop 4 cols, tablet 2 cols, mobile 1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                id={`pricing-card-${plan.id}`}
                className={`rounded-xl sm:rounded-2xl p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#FAF2E8]/40 to-[#FAF8F5] border-2 border-[#B5654A] shadow-md md:-translate-y-1.5'
                    : 'bg-[#FAF8F5] border border-[#E4DED4] hover:border-[#B5654A]/40 shadow-xs'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B5654A] text-[#FAF8F5] text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-xs flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Más elegido</span>
                  </div>
                )}

                <div>
                  {/* Plan Name */}
                  <h3 className="font-fraunces text-lg sm:text-xl text-[#1A1815] font-medium mb-1.5 sm:mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#E4DED4]">
                    <div className="flex items-baseline space-x-1">
                      <span className="font-fraunces text-2xl sm:text-4xl font-medium text-[#1A1815]">
                        {plan.price}
                      </span>
                    </div>
                    {plan.period && (
                      <span className="text-[11px] sm:text-xs text-[#6B655C] mt-0.5 sm:mt-1 block">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-xs sm:text-sm text-[#6B655C]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B5654A] mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Button */}
                <button
                  id={`btn-plan-${plan.id}`}
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    isPopular
                      ? 'bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] shadow-xs'
                      : 'border border-[#B5654A] text-[#B5654A] hover:bg-[#B5654A] hover:text-[#FAF8F5]'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Small Note */}
        <div className="mt-10 text-center text-xs text-[#6B655C]">
          <p>¿Tienes dudas sobre qué opción elegir? Consulta con nuestro equipo en recepción o agenda una llamada de asesoramiento.</p>
        </div>

      </div>
    </section>
  );
};
