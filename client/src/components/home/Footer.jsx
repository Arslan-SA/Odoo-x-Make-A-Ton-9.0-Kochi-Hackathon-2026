import { Mail, MapPin, Phone } from 'lucide-react'
import Brand from './Brand'

const PRODUCT_LINKS = ['Features', 'Pricing', 'Integrations', 'Changelog']

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div id="about" className="scroll-mt-20 md:col-span-1">
          <Brand />
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Brightloop is a subscription management platform for recurring billing, invoices, and
            revenue insight.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#0B1A35]">Product</h3>
          <ul className="mt-4 space-y-2.5">
            {PRODUCT_LINKS.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className="text-sm text-slate-600 transition-colors hover:text-indigo-600"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div id="contact" className="scroll-mt-20 md:col-span-2">
          <h3 className="text-sm font-semibold text-[#0B1A35]">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-indigo-600" aria-hidden="true" />
              <a href="mailto:hello@brightloop.io" className="transition-colors hover:text-indigo-600">
                hello@brightloop.io
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-indigo-600" aria-hidden="true" />
              <a href="tel:+15550123456" className="transition-colors hover:text-indigo-600">
                +1 (555) 012-3456
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-indigo-600" aria-hidden="true" />
              <span>San Francisco, CA</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <p className="mx-auto max-w-6xl px-5 py-6 text-center text-xs text-slate-500 sm:px-8">
          © {new Date().getFullYear()} Brightloop. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
