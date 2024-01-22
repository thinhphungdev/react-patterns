import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import mojs from 'mo-js';
import { generateRandomNumber } from '../utils/generateRandomNumber';
import styles from './index.css';
import userCustomeStyles from './usage.css';

/** ====================================
     *         Custom Hook for animations
    ==================================== **/
const useClapAnimation = ({ clapRef, clapCountRef, clapCountTotalRef }) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    () => new mojs.Timeline()
  );

  useLayoutEffect(() => {
    if (!clapRef || !clapCountRef || !clapCountTotalRef) return;

    const tlDuration = 300;

    const triangleBurst = new mojs.Burst({
      parent: clapRef,
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: 'polygon',
        radius: { 6: 0 },
        scale: 1,
        stroke: 'rgba(211,84,0 ,0.5)',
        strokeWidth: 2,
        angle: 210,
        delay: 30,
        speed: 0.2,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: tlDuration,
      },
    });

    const circleBurst = new mojs.Burst({
      parent: clapRef,
      radius: { 50: 75 },
      angle: 25,
      duration: tlDuration,
      children: {
        shape: 'circle',
        fill: 'rgba(149,165,166 ,0.5)',
        delay: 30,
        speed: 0.2,
        radius: { 3: 0 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
      },
    });

    const countAnimation = new mojs.Html({
      el: clapCountRef,
      isShowStart: false,
      isShowEnd: true,
      y: { 0: -30 },
      opacity: { 0: 1 },
      duration: tlDuration,
    }).then({
      opacity: { 1: 0 },
      y: -80,
      delay: tlDuration / 2,
    });

    const countTotalAnimation = new mojs.Html({
      el: clapCountTotalRef,
      isShowStart: false,
      isShowEnd: true,
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
      y: { 0: -3 },
    });

    const scaleButton = new mojs.Html({
      el: clapRef,
      duration: tlDuration,
      scale: { 1.3: 1 },
      easing: mojs.easing.out,
    });

    if (typeof clapRef === 'string') {
      const clap = document.getElementById('clap');
      clap.style.transform = 'scale(1, 1)';
    } else {
      clapRef.style.transform = 'scale(1, 1)';
    }

    const newAnimationTimeline = animationTimeline.add([
      countAnimation,
      countTotalAnimation,
      scaleButton,
      circleBurst,
      triangleBurst,
    ]);
    setAnimationTimeline(newAnimationTimeline);
  }, [clapCountRef, clapCountTotalRef, clapRef]);

  return animationTimeline;
};

/** ====================================
     *      🔰 MediumClap
    ==================================== **/
const initialState = {
  count: 0,
  countTotal: generateRandomNumber(500, 10000),
  isClicked: false,
};

const MAXIMUM_USER_CLAP = 12;

const MediumClapContext = createContext();

const useMediumClapContext = () => {
  const context = useContext(MediumClapContext);
  return context;
};

const MediumClap = ({
  children,
  onClap,
  style: userStyles = {},
  classNames = '',
}) => {
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal } = clapState;
  const [{ clapRef, clapCountRef, clapCountTotalRef }, setRefState] = useState(
    {}
  );

  const animationTimeline = useClapAnimation({
    clapRef,
    clapCountRef,
    clapCountTotalRef,
  });

  const setref = useCallback((node) => {
    setRefState((prevRefState) => {
      return {
        ...prevRefState,
        [node.dataset.refkey]: node,
      };
    });
  }, []);

  const handleClapClick = () => {
    animationTimeline.replay();

    setClapState({
      count: Math.min(count + 1, MAXIMUM_USER_CLAP),
      countTotal: count < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
      isClicked: true,
    });

    onClap(clapState);
  };

  const memoizedMediumClapContextValue = useMemo(
    () => ({ ...clapState, setref }),
    [clapState, setref]
  );

  return (
    <MediumClapContext.Provider value={memoizedMediumClapContextValue}>
      <button
        style={userStyles}
        ref={setref}
        data-refkey='clapRef'
        className={`${styles.clap} ${classNames}`}
        onClick={handleClapClick}
      >
        {children}
      </button>
    </MediumClapContext.Provider>
  );
};

/** ====================================
     *      🔰SubComponents
    Smaller Component used by <MediumClap />
    ==================================== **/

const ClapIcon = ({ style: userStyles, classNames = '' }) => {
  const { isClicked } = useMediumClapContext();
  return (
    <span>
      <svg
        style={userStyles}
        id='clapIcon'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='-549 338 100.1 125'
        className={`${styles.icon} ${
          isClicked && styles.checked
        } ${classNames}`}
      >
        <path d='M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z' />
        <path d='M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9' />
      </svg>
    </span>
  );
};
const ClapCount = ({ style: userStyles, classNames = '' }) => {
  const { count, setref } = useMediumClapContext();

  return (
    <span
      style={userStyles}
      ref={setref}
      data-refkey='clapCountRef'
      className={`${styles.count} ${classNames}`}
    >
      +{count}
    </span>
  );
};
const CountTotal = ({ style: userStyles, classNames = '' }) => {
  const { countTotal, setref } = useMediumClapContext();

  return (
    <span
      ref={setref}
      data-refkey='clapCountTotal'
      className={`${styles.total} ${classNames}`}
    >
      {countTotal}
    </span>
  );
};

MediumClap.Icon = ClapIcon;
MediumClap.Count = ClapCount;
MediumClap.Total = CountTotal;

/** ====================================
        *        🔰USAGE
        Below's how a potential user
        may consume the component API
    ==================================== **/

const Usage = () => {
  const [count, setCount] = useState(0);

  function handleClap(clapState) {
    setCount(clapState.count + 1);
  }

  return (
    <div style={{ width: '100%' }}>
      <MediumClap onClap={handleClap} classNames={userCustomeStyles.clap}>
        <MediumClap.Icon classNames={userCustomeStyles.icon} />
        <MediumClap.Count classNames={userCustomeStyles.count} />
        <MediumClap.Total classNames={userCustomeStyles.total} />
      </MediumClap>
      <div>You have clapped: {count}</div>
    </div>
  );
};

export default Usage;
