import React, { useEffect, useRef, useState } from 'react';

const DemoForm = () => {
  const hiddenDivRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement>();

  useEffect(() => {
    if (scriptRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://memberspage.ck.page/c6f45b0fbb/index.js';
    script.async = true;
    script.setAttribute('data-uid', 'c6f45b0fbb');

    scriptRef.current = script;
    hiddenDivRef.current?.before(scriptRef.current);
  }, []);

  return (
    <div id="demo" className="flex justify-center mt-8">
      <div ref={hiddenDivRef}></div>
    </div>
  );
};

export default DemoForm;
