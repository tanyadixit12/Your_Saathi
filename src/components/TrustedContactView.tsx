import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Phone,
  HeartHandshake,
  AlertTriangle,
  PhoneCall,
  Edit2,
  Save,
  ArrowLeft,
  Shield,
  LifeBuoy,
} from 'lucide-react';

export const TrustedContactView: React.FC = () => {
  const { trustedContacts, updateContact, setCurrentView, t } = useApp();
  const contact = trustedContacts[0] || {
    name: 'Rahul Sharma',
    relationship: 'Son',
    phone: '+1-555-0199',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateContact(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline focus-visible:ring-2 ring-emerald-500 rounded p-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {t.myDay}</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <Phone className="w-10 h-10 text-emerald-600" />
            <span>Trusted Contacts & Safety Net</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            Fast access to family and emergency services when you need help.
          </p>
        </div>
      </div>

      {/* EMERGENCY SERVICES BANNER */}
      <div className="bg-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-rose-700">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-700 text-sm font-black tracking-wide">
            <LifeBuoy className="w-5 h-5" />
            <span>Immediate Assistance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight">
            Medical or Police Emergency?
          </h2>
          <p className="text-lg sm:text-xl font-medium text-rose-100 max-w-xl">
            If you or someone else is in immediate danger or experiencing severe pain, contact emergency services immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <a
            href="tel:911"
            className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white text-rose-800 hover:bg-rose-100 font-black text-2xl shadow-2xl transition-transform active:scale-95 border-3 border-rose-200 min-h-[64px] focus-visible:ring-4 ring-white"
            aria-label="Call Emergency 911 or 112"
          >
            <PhoneCall className="w-7 h-7" />
            <span>Call 911 / 112</span>
          </a>
        </div>
      </div>

      {/* Mandatory Emergency Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-300 leading-relaxed">
          <strong>Mandatory safety notice:</strong> For immediate emergencies, call your local emergency service (911 or 112). Aasra is a supportive companion application and is not an emergency response or 911 dispatch service.
        </p>
      </div>

      {/* TRUSTED FAMILY CONTACT CARD */}
      <div className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                Primary Trusted Family Contact
              </h2>
              <span className="text-base font-bold text-stone-600 dark:text-stone-400">
                Quick 1-tap call for daily check-ins or questions
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-base transition-colors text-stone-800 dark:text-white focus-visible:ring-2 ring-emerald-500 min-h-[44px]"
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Contact'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none focus-visible:ring-4 ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="e.g. Son, Daughter, Neighbor"
                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none focus-visible:ring-4 ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-extrabold text-stone-800 dark:text-stone-200 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold text-lg text-stone-900 dark:text-white focus:border-emerald-500 focus:outline-none focus-visible:ring-4 ring-emerald-400"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-md focus-visible:ring-4 ring-emerald-400 min-h-[48px]"
              >
                <Save className="w-5 h-5" />
                <span>Save Contact Details</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="space-y-2">
              <div className="text-3xl font-black text-stone-950 dark:text-white flex items-center gap-3">
                <span>{contact.name}</span>
                <span className="text-base font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {contact.relationship}
                </span>
              </div>
              <p className="text-2xl font-bold text-stone-700 dark:text-stone-300 font-mono">
                {contact.phone}
              </p>
            </div>

            <a
              href={`tel:${contact.phone}`}
              className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl shadow-xl transition-transform active:scale-95 border-2 border-emerald-700 min-h-[64px] focus-visible:ring-4 ring-emerald-400"
              aria-label={`Call ${contact.name}`}
            >
              <PhoneCall className="w-7 h-7" />
              <span>Call {contact.name} Now</span>
            </a>
          </div>
        )}
      </div>

      {/* EMERGENCY PREPAREDNESS REMINDER */}
      <div className="bg-stone-100 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-xl font-black text-stone-950 dark:text-white mb-3 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-600" />
          <span>Quick Safety Tips for Your Home:</span>
        </h3>
        <ul className="space-y-2 text-base sm:text-lg font-bold text-stone-800 dark:text-stone-300">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-black">•</span>
            <span>Keep your home address and apartment number clearly written by your telephone.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-black">•</span>
            <span>Always keep a paper printout of your current medications near your bedside or refrigerator.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-black">•</span>
            <span>If someone ever calls asking for your bank PIN, card number, or OTP, hang up immediately and call {contact.name}.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
