import React from 'react';

const TermsView: React.FC = () => {
  const terms = [
    {
      title: '1. Ordering & Services',
      points: [
        'All orders must be placed through our official website/app or via our authorized channels (WhatsApp / email).',
        'Customers must provide accurate details when submitting an order (name, contact, order specifications, and file attachments).',
        'Hi Drawpix reserves the right to clarify, adjust, or request additional information before starting the order.',
      ],
    },
    {
      title: '2. Pricing & Payment',
      points: [
        'All service prices are clearly displayed on our website or communicated during consultation.',
        'Payments must be made in full or as agreed before the delivery of the final product.',
        'Accepted Payment Method: Online bank transfer to Hi Drawpix account. Bank details will be provided upon order confirmation.',
        'Payment confirmation (screenshot or transaction reference) must be sent to admin.',
        'Work will only begin after payment verification (unless otherwise agreed).',
      ],
    },
    {
      title: '3. Delivery & Revisions',
      points: [
        'Orders will be delivered digitally via download link or physically if applicable.',
        'After delivery, customers have 3 days to request revisions or report issues.',
        'Requests beyond the 3-day window may not be accommodated.',
        'Additional revisions outside the original scope may incur extra charges.',
      ],
    },
    {
        title: '4. Customer Responsibilities',
        points: [
            'Customers must provide all necessary files, logos, text, and instructions for the project.',
            'Hi Drawpix is not responsible for delays due to missing or incorrect customer information.',
            'Customers must check the delivered product immediately upon receipt and report any errors within 3 days.',
        ]
    },
    {
        title: '5. Cancellation & Refunds',
        points: [
            'Orders may be cancelled before work begins.',
            'Refunds will be processed according to the payment policy and any work already completed may be deducted.',
            'Once the product is delivered, refunds will not be issued, except in cases of technical errors or mistakes by Hi Drawpix.',
        ]
    },
    {
        title: '6. Intellectual Property',
        points: [
            'Customers retain rights to their original content.',
            'Hi Drawpix retains copyright for templates, designs, or methods created by our team unless otherwise agreed.',
            'Any unauthorized use, duplication, or redistribution of Hi Drawpix content is prohibited.',
        ]
    },
    {
        title: '7. Privacy & Data Protection',
        points: [
            'Customer details will be stored securely in Firebase and will not be shared with third parties except as required for order fulfillment.',
            'Uploaded files will be used solely for completing the order and may be deleted after delivery.',
        ]
    },
    {
        title: '8. General Terms',
        points: [
            'Hi Drawpix reserves the right to modify prices, offers, and terms at any time.',
            'All orders are subject to availability and feasibility.',
            'Any disputes will be resolved according to the laws of Sri Lanka.',
        ]
    }
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="glass-card max-w-4xl mx-auto p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-accent mb-8">Terms & Conditions</h1>
        <div className="space-y-6 text-text-secondary leading-relaxed">
          {terms.map((term, index) => (
            <div key={index}>
              <h2 className="text-xl font-semibold text-text-primary mb-2">{term.title}</h2>
              <ul className="list-disc list-inside space-y-1">
                {term.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="pt-6 font-semibold text-text-primary">
            By placing an order, you acknowledge that you have read and agreed to these terms.
          </p>
        </div>
      </div>
    </main>
  );
};

export default TermsView;
