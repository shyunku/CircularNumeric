import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CircularDigit = ({ value, onHeightChange, ...rest }) => {
  const digitsRef = useRef(null);

  useEffect(() => {
    if (!digitsRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const height = digitsRef.current.clientHeight;
      if (onHeightChange) onHeightChange(height / 10);
      console.log("digits height change", height);
    });
    resizeObserver.observe(digitsRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="circular-digit" ref={digitsRef} {...rest}>
      {Array(10)
        .fill(null)
        .map((_, index) => {
          return (
            <div className="circular-digit__digit" key={index}>
              {index}
            </div>
          );
        })}
    </div>
  );
};

const CircularRoller = ({ digit, digitHeight, onHeightChange, valueDirection, ind }) => {
  const [lastDigitChangeTime, setLastDigitChangeTime] = useState(0);
  const [valueChangeStack, setValueChangeStack] = useState(0);
  const [nextTransitionDuration, setNextTransitionDuration] = useState(500);

  const rollerRef = useRef(null);
  const isDigit = useMemo(() => {
    const parsed = parseInt(digit);
    return digit.length === 1 && parsed >= 0 && parsed <= 9;
  }, [digit]);
  const parsed = useMemo(() => {
    return parseInt(digit);
  }, [digit]);
  const [appendee, setAppendee] = useState(1);

  const topOffset = useMemo(() => {
    return (parsed + 10 * (appendee - 0)) * digitHeight;
  }, [parsed, appendee, digitHeight]);

  const transitionStyle = useMemo(() => {
    // return `none`;
    return `${nextTransitionDuration / 1000}s ease`;
  }, [nextTransitionDuration]);

  const clearApendee = useCallback(() => {
    setAppendee((app) => {
      if (app > 0) {
        const childrens = Array.from(rollerRef.current.children);
        for (let i = 0; i < childrens.length - 1; i++) {
          const child = childrens[i];
          const next = childrens[i + 1];
          if (next.classList.contains("current")) break;
          rollerRef.current.removeChild(child);
          app++;
        }
      } else if (app < 0) {
        const childrens = Array.from(rollerRef.current.children).reverse();
        for (let i = 0; i < childrens.length - 1; i++) {
          const child = childrens[i];
          const next = childrens[i + 1];
          if (next.classList.contains("current")) break;
          rollerRef.current.removeChild(child);
          app++;
        }
      }
      return app;
    });
  }, [appendee, rollerRef, valueDirection]);

  useEffect(() => {
    if (valueChangeStack === 0 || lastDigitChangeTime === 0) {
      setLastDigitChangeTime(Date.now());
    } else {
      const current = Date.now();
      const elapsed = current - lastDigitChangeTime;

      if (elapsed < 500) return;

      const avgValueChangePeriod = elapsed / valueChangeStack;
      let newPeriod = avgValueChangePeriod * 0.9;
      if (newPeriod > 500) {
        newPeriod = 500;
      }

      setNextTransitionDuration(newPeriod);
      setLastDigitChangeTime(current);
      setValueChangeStack(0);

      // clear appendee & remove unnecessary children
      const absAppendee = Math.abs(appendee);
      if (absAppendee > 10) {
        clearApendee();
      }
    }
  }, [valueChangeStack, lastDigitChangeTime, appendee, valueDirection, setAppendee]);

  useEffect(() => {
    setValueChangeStack((valueChangeStack) => valueChangeStack + 1);
  }, [digit]);

  useEffect(() => {
    rollerRef.current.style.transition = transitionStyle;
  }, [nextTransitionDuration]);

  // periodically check appendee and re calculate it

  // append new 'next' digits after 'next digits' if value is increasing
  // prepend new 'prev' digits before 'prev digits' if value is decreasing
  useEffect(() => {
    if (!isDigit) return;
    if (valueDirection === 0) return;
    // if (nextTransitionDuration < 30) return;
    const nextDigitEl = document.createElement("div");
    nextDigitEl.className = "circular-digit";
    nextDigitEl.innerHTML = Array(10)
      .fill(null)
      .map((e, ind) => `<div class="circular-digit__digit">${ind}</div>`)
      .join("");

    if (valueDirection > 0) {
      rollerRef.current.appendChild(nextDigitEl);
      setAppendee((appendee) => appendee + 1);
    } else if (valueDirection < 0) {
      rollerRef.current.prepend(nextDigitEl);
      setAppendee((appendee) => appendee - 1);
    }
  }, [digit, isDigit, parsed, valueDirection, appendee]);

  // remove prepended 'prev' digits if apendee is not zero
  // (removing element that has no 'current' class)
  // and re calculate appendee
  const onRollerTransitionEnd = useCallback(() => {
    if (!isDigit) return;
    if (appendee !== 0) {
      // disable transition
      rollerRef.current.style.transition = "none";
    }
    clearApendee();

    // re enable transition
    // rollerRef.current.style.transition = savedTransitionStyle;
    setTimeout(() => {
      rollerRef.current.style.transition = transitionStyle;
    }, 50);
  }, [digit, isDigit, parsed, valueDirection, appendee]);

  return (
    <>
      <div style={{ position: "fixed", top: `-${200 + 50 * ind}px`, fontSize: "20px", color: "red" }}>
        {appendee ?? "-"}
      </div>
      <div
        className="circular-roller"
        style={{ top: `${-topOffset}px` }}
        onTransitionEnd={onRollerTransitionEnd}
        ref={rollerRef}
      >
        {isDigit ? (
          <>
            <CircularDigit></CircularDigit>
            <CircularDigit className="current" onHeightChange={onHeightChange}></CircularDigit>
            <CircularDigit></CircularDigit>
          </>
        ) : (
          <div className="circular-symbol">{digit}</div>
        )}
      </div>
    </>
  );
};

const CircularNumeric = ({ value }) => {
  const [prevValue, setPrevValue] = useState(value);
  const prevDigits = useMemo(() => {
    return `${prevValue}`.split("");
  }, [prevValue]);
  const digits = useMemo(() => {
    return `${value}`.split("");
  }, [value]);
  const [digitHeight, setDigitHeight] = useState(50);
  const onHeightChange = useCallback((changedHeight) => {
    setDigitHeight(changedHeight);
  }, []);

  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  return (
    <div className="circular-numeric" style={{ height: `${digitHeight}px` }}>
      {digits.map((digit, ind) => {
        const prevUpperDigit = prevDigits?.[ind - 1] ?? 0;
        const currUpperDigit = digits?.[ind - 1] ?? 0;

        const upperDigitDirection = currUpperDigit - prevUpperDigit;
        return (
          <CircularRoller
            key={ind}
            digit={digit}
            digitHeight={digitHeight}
            onHeightChange={onHeightChange}
            valueDirection={upperDigitDirection}
            ind={ind}
          />
        );
      })}
    </div>
  );
};

export default CircularNumeric;
