import { Fragment } from 'react';

function FormattedText({ text }: { text: string }) {
  const newText = text.split('\n').map((str, index, array) =>
    index === array.length - 1 ? (
      str
    ) : (
      <Fragment key={index}>
        {str}
        <br />
      </Fragment> // Close the Fragment tag properly
    )
  );

  return <>{newText}</>;
}

export default FormattedText; // Correct the export statement
