/**
 * Products Fixture for Brightloop / Odoo Hackathon
 * 
 * Each product defines:
 * - name: String (required)
 * - type: 'SERVICE' | 'CONSUMABLE' | 'DIGITAL' | 'ADDON'
 * - salesPrice: Number (base price)
 * - costPrice: Number (internal cost)
 * - notes: String (optional description)
 * - variants: Array of { attribute, value, priceModifier }
 *     - PriceModifier adds to or subtracts from base salesPrice.
 *     - Example: { attribute: 'Brand', value: 'Odoo', priceModifier: 560 }
 *       makes the unit price 2000 + 560 = 2560.
 * - isActive: Boolean (default: true)
 */

module.exports = [
  {
    name: 'Brightloop Enterprise ERP',
    type: 'SERVICE',
    salesPrice: 2000,
    costPrice: 600,
    notes: 'Core business management suite with brand variants',
    variants: [
      { attribute: 'Brand', value: 'Odoo', priceModifier: 560 },
      { attribute: 'Brand', value: 'Brightloop Native', priceModifier: 0 },
      { attribute: 'Brand', value: 'Custom Hosted', priceModifier: 350 },
    ],
    isActive: true,
  },
  {
    name: 'Cloud Analytics Add-on',
    type: 'ADDON',
    salesPrice: 500,
    costPrice: 120,
    notes: 'Switchable real-time finance reporting add-on',
    variants: [
      { attribute: 'Tier', value: 'Pro', priceModifier: 300 },
      { attribute: 'Tier', value: 'Standard', priceModifier: 0 },
    ],
    isActive: true,
  },
  {
    name: 'Dedicated Team Seat Pack',
    type: 'SERVICE',
    salesPrice: 800,
    costPrice: 200,
    notes: 'Per-seat license for growing internal teams',
    variants: [
      { attribute: 'Tier', value: '5-Seat Pack', priceModifier: 0 },
      { attribute: 'Tier', value: '10-Seat Pack', priceModifier: 600 },
    ],
    isActive: true,
  },
  {
    name: 'Priority 24/7 Support SLA',
    type: 'SERVICE',
    salesPrice: 1200,
    costPrice: 350,
    notes: 'Dedicated account manager, 1-hour response SLA, and direct phone line',
    variants: [
      { attribute: 'Coverage', value: 'Business Hours', priceModifier: -300 },
      { attribute: 'Coverage', value: '24/7 Global', priceModifier: 0 },
    ],
    isActive: true,
  },
  {
    name: 'API Connector & Webhook Hub',
    type: 'DIGITAL',
    salesPrice: 400,
    costPrice: 50,
    notes: 'High-throughput webhook streaming and third-party integration pipes',
    variants: [
      { attribute: 'Throughput', value: '100k events/mo', priceModifier: 0 },
      { attribute: 'Throughput', value: '1M events/mo', priceModifier: 400 },
    ],
    isActive: true,
  },
  {
    name: 'Custom Domain & White-labeling',
    type: 'DIGITAL',
    salesPrice: 300,
    costPrice: 40,
    notes: 'Brand your customer portal with your own domain and custom theme colors',
    variants: [],
    isActive: true,
  },
];
