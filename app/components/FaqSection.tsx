import { useState } from 'react';

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
        <div className="p-4 shadow-xl rounded-md">
          <h3 className="font-semibold text-lg text-gray-800">{question}</h3>
          <div
            className={`${
              isOpen ? '' : 'hidden'
            } mt-2 p-4 text-gray-600 rounded-md`}
          >
            <p>{answer}</p>
          </div>
        </div>
      </button>
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: 'What is Memberspage?',
      answer:
        'Memberspage is a subscription management platform. It allows creators to monetize their content with pay-to-access Telegram channels. Creators receive a custom landing page that acts as a paywall.',
    },
    {
      question: 'Who is Memberspage for?',
      answer:
        'Business coaches, fitness influencers, betting tipsters, trading gurus, real estate professionals, the list goes on. Memberspage is for anyone who creates or wants to create premium digital content. It allows creators to monetize their content.',
    },
    {
      question: 'How long is the onboarding process?',
      answer:
        'It takes roughly 5 minutes from start to finish: set up your custom page, create and link your TG channels and groups, and start accepting payments.',
    },
    {
      question: 'How do I get paid?',
      answer:
        'We use a payment processor called Stripe that will deposit your earnings directly into your bank account.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'It’s free to get started. You will pay absolutely nothing until you get paid subscribers and start earning money.',
    },
    {
      question: 'Do I need an existing audience?',
      answer:
        'No, you don’t need an existing audience. You can start building your audience on Memberspage. Share your page on your socials and start growing your audience. It’s all free',
    },
    {
      question: 'Can I use an existing Telegram channel?',
      answer: 'Yes, you can link any channel to your Memberspage.',
    },
    {
      question: 'How is Memberspage different from Linktree?',
      answer:
        'Memberspage allows creators to earn passive income from subscriptions. It’s everything Linktree is and more because it also manages user memberships allowing creators to simply...create. You just link your content channels, choose a price, and we take care of the rest. Memberspage is a one-stop shop.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-8">
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
