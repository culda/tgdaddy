import React, { useState } from 'react';

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
        <div className="p-4 bg-white shadow rounded-md">
          <h3 className="font-semibold text-lg text-blue-600">{question}</h3>
        </div>
      </button>
      <div
        className={`${
          isOpen ? '' : 'hidden'
        } mt-2 p-4 bg-white shadow rounded-md`}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: 'What is Memberspage?',
      answer:
        'Memberspage is a subscription management platform. It automates the process of creating and managing a membership business.',
    },
    {
      question: 'Who is Memberspage for?',
      answer:
        'Business coaches, fitness influencers, betting tipsters, trading gurus, real estate professionals, the list goes on. Memberspage is for anyone who creates or wants to create premium digital content. It allows creators to monetize their content.',
    },

    {
      question: 'How long is the onboarding process?',
      answer:
        'It takes roughly 5 minutes to set up your custom page, link your channels, and start accepting payments.',
    },
    {
      question: 'How do I get paid?',
      answer:
        'We use a payment processor called Stripe that will deposit your earnings directly into your bank account. You will need to create a Stripe account to receive payments. It only takes 1 minute',
    },
    {
      question: 'Do I need an existing audience?',
      answer:
        'No, you don’t need an existing audience. You can start building your audience on Memberspage. You will receive a custom landing page that you can share on your socials. ',
    },
    {
      question: 'Can I use an existing Telegram channel?',
      answer: 'Yes, you can link any channel to your Memberspage.',
    },
    {
      question: 'How is Memberspage different from Linktree?',
      answer:
        'Memberspage manages all aspects of the subscriptions. You just link your content channels, choose a price, and we take care of the rest. Memberspage is a one-stop shop',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Frequently asked questions.</h2>
      <p className="mb-8">
        {' '}
        If you have any other questions, please reach out via{' '}
        <a href="mailto:culda@members.page" target="_blank">
          <b>email</b>,
        </a>{' '}
        <a href="https://twitter.com/members_page" target="_blank">
          <b>Twitter</b>
        </a>{' '}
        or{' '}
        <a href="https://www.linkedin.com/in/culda/" target="_blank">
          <b>Linkedin</b>
        </a>
        . Alternatively, check out the Telegram channels in the footer.
      </p>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
