import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SideRays from "./SideRays";
import quitIcon from "./assets/quit.png";

gsap.registerPlugin(useGSAP);

const logoWhite = new URL("../../logo/fofolab白@2x.png", import.meta.url).href;
const eyeVideoModules = import.meta.glob(
  "../../logo/白色动眼动画.{mp4,mov,webm}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);
const eyeVideo =
  eyeVideoModules["../../logo/白色动眼动画.mp4"] ??
  eyeVideoModules["../../logo/白色动眼动画.mov"] ??
  eyeVideoModules["../../logo/白色动眼动画.webm"];

const detailModules = import.meta.glob("../../PJ*/*.{jpg,jpeg,png,JPG,JPEG,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
});
const squareCoverModules = import.meta.glob(
  "../../项目封面（方形）/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);
const optimizedIntroModules = import.meta.glob(
  "./intro-assets/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);
const coverLogoFrameModules = import.meta.glob("../../logo/png序列/*.{png,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
});

const collator = new Intl.Collator("zh-Hans-CN", {
  numeric: true,
  sensitivity: "base",
});

const coverLogoFrames = Object.entries(coverLogoFrameModules)
  .sort(([pathA], [pathB]) => collator.compare(getFileNameFromPath(pathA), getFileNameFromPath(pathB)))
  .map(([, url]) => url);
const COVER_LOGO_FPS = 30;
const COVER_LOGO_INITIAL_PRELOAD = 12;

const optimizedIntroAssets = Object.entries(optimizedIntroModules).sort(([pathA], [pathB]) =>
  collator.compare(getFileNameFromPath(pathA), getFileNameFromPath(pathB))
);
const portraitImage =
  optimizedIntroAssets.find(([path]) => /portrait|肖像/i.test(getFileNameFromPath(path)))?.[1] ??
  optimizedIntroAssets.find(([path]) => !/logo/i.test(getFileNameFromPath(path)))?.[1];
const introLogos = optimizedIntroAssets
  .filter(([path]) => /logo/i.test(getFileNameFromPath(path)))
  .map(([, url]) => url);
const squareCoverEntries = Object.entries(squareCoverModules).map(([path, url]) => ({
  path,
  url,
  name: normalizeProjectName(getFileNameFromPath(path)),
}));

function getFolderFromPath(path) {
  return path.split("/")[2];
}

function getFileNameFromPath(path) {
  return path.split("/").pop() ?? path;
}

function getProjectNumber(folder) {
  const match = folder.match(/^PJ(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function getProjectTitle(folder) {
  return folder.replace(/^PJ\d+[-_\s]*/i, "");
}

function normalizeProjectName(value) {
  return value
    .replace(/\.[^.]+$/g, "")
    .replace(/[-_\s]*封面(?:-\d+)?$/g, "")
    .replace(/设计$/g, "")
    .replace(/\s/g, "")
    .toLowerCase();
}

function getCoverTokens(title) {
  const normalized = normalizeProjectName(title);
  const tokens = [normalized];
  const year = normalized.match(/\d{4}/)?.[0];

  if (year) tokens.push(year);
  if (normalized.includes("暑期档")) tokens.push("暑期档");
  if (normalized.includes("nft")) tokens.push("大麦nft");
  if (normalized.includes("大麦焕新")) tokens.push("大麦焕新");
  if (normalized.includes("电影宣发")) tokens.push("电影宣发");
  if (normalized.includes("电影票根")) tokens.push("电影票根");
  if (normalized.includes("会员徽章")) tokens.push("会员徽章");
  if (normalized.includes("会员场馆")) tokens.push("会员场馆");
  if (normalized.includes("微信跨年")) tokens.push("微信跨年");
  if (normalized.includes("聚光好戏")) tokens.push("聚光好戏");
  if (normalized.includes("哈利波特")) tokens.push("哈利波特");

  return [...new Set(tokens.filter(Boolean))];
}

function getSquareCover(title, fallback) {
  const tokens = getCoverTokens(title);
  const bestMatch = squareCoverEntries
    .map((entry) => {
      const score = tokens.reduce((total, token) => {
        if (entry.name === token) return total + 24;
        if (entry.name.includes(token) || token.includes(entry.name)) return total + 10;
        return total;
      }, 0);
      return { ...entry, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  return bestMatch?.score > 0 ? bestMatch.url : fallback;
}

function compareImagePath([pathA], [pathB]) {
  return collator.compare(getFileNameFromPath(pathA), getFileNameFromPath(pathB));
}

function getProjectImages(folder) {
  return Object.entries(detailModules)
    .filter(([path]) => path.startsWith(`../../${folder}/`))
    .sort(compareImagePath)
    .map(([, url]) => url);
}

const projectFolders = [...new Set(Object.keys(detailModules).map(getFolderFromPath))]
  .filter(Boolean)
  .sort((a, b) => getProjectNumber(a) - getProjectNumber(b));

const projectIntros = [
  "通过故事化、情感化的品牌营销设计帮助平台建立购票心智。",
  "将电影元素化，融入到暑期档的整体设计中。",
  "沉淀创意设计方法，升级内容营销设计思路，搭建设计体系。",
  "分享源于自我表达，分享源于情感的共鸣。",
  "以电影为纽带，链接用户的精神世界，快来寻找你的“灵魂搭子”。",
  "年度聚光好戏评选，虚位以待。",
  "以NFT为基石，用户构建一个永不褪色的精神世界。",
  "魔法师返校日，快来赢取你的挑战证书。",
  "买票上大麦，焕新好运来。",
  "一首连接银幕内外的两个时空的诗。",
  "在现实生活淘金，在精神世界淘麦。",
];

const projects = projectFolders.map((folder) => {
  const images = getProjectImages(folder);
  const title = getProjectTitle(folder);
  const projectNumber = getProjectNumber(folder);

  return {
    title,
    titleEn: title,
    intro: projectIntros[projectNumber - 1] ?? "项目简介占位，稍后补充。",
    folder,
    cover: getSquareCover(title, images[0]),
    images,
  };
});

function EyeTracker({ className = "" }) {
  const trackerRef = useRef(null);
  const videoRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const tracker = trackerRef.current;
    const video = videoRef.current;
    if (!tracker || !video) return undefined;

    let duration = 0;
    let targetTime = 0;

    const syncDuration = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration > 0) {
        targetTime = duration * 0.5;
        video.currentTime = targetTime;
      }
      video.pause();
    };

    const handlePointerMove = (event) => {
      const rect = video.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      const normalized = ((angle / (Math.PI * 2)) + 1.25) % 1;

      if (duration > 0) {
        targetTime = Math.min(duration - 0.02, Math.max(0, normalized * duration));
      }

      tracker.style.setProperty("--eye-tilt", `${Math.max(-2.4, Math.min(2.4, dx / 180))}deg`);

      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        if (duration > 0 && Math.abs(video.currentTime - targetTime) > 0.01) {
          video.currentTime = targetTime;
        }
        video.pause();
      });
    };

    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("loadeddata", syncDuration);
    video.addEventListener("durationchange", syncDuration);
    syncDuration();
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("loadeddata", syncDuration);
      video.removeEventListener("durationchange", syncDuration);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className={`eyeTracker ${className}`} ref={trackerRef} aria-label="FoFo eye tracker">
      <video
        className="eyeTrackerVideo"
        ref={videoRef}
        src={eyeVideo}
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;

    if (image.decode) {
      image.decode().then(resolve).catch(resolve);
    }
  });
}

function preloadVideo(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const video = document.createElement("video");
    let hasResolved = false;
    const resolveOnce = () => {
      if (hasResolved) return;
      hasResolved = true;
      video.removeAttribute("src");
      video.load();
      resolve();
    };

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.addEventListener("loadeddata", resolveOnce, { once: true });
    video.addEventListener("error", resolveOnce, { once: true });
    window.setTimeout(resolveOnce, 1800);
    video.src = src;
    video.load();
  });
}

function uniqueAssets(assets) {
  return [...new Set(assets.filter(Boolean))];
}

function BootLoader({ progress, isLeaving }) {
  const progressValue = Math.max(0.04, Math.min(progress, 1));

  return (
    <div
      className={`bootLoader ${isLeaving ? "bootLoader--leaving" : ""}`}
      aria-label="Loading fofola"
      aria-live="polite"
    >
      <div className="bootLoaderCenter">
        <EyeTracker className="eyeTracker--loader" />
        <p className="bootLoaderText">
          loading<span aria-hidden="true">.</span><span aria-hidden="true">.</span><span className="bootLoaderBlink" aria-hidden="true">.</span>
        </p>
      </div>

      <div className="bootProgress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progressValue})` }} />
      </div>
    </div>
  );
}

function runIdleTask(task, timeout = 900) {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout });
  }

  return window.setTimeout(task, 120);
}

function cancelIdleTask(id) {
  if ("cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}

function Cover({ onEnter }) {
  const coverRef = useRef(null);
  const moreButtonRef = useRef(null);
  const logoFrameRef = useRef(null);
  const [isLogoAnimationDone, setIsLogoAnimationDone] = useState(false);

  useEffect(() => {
    const image = logoFrameRef.current;
    if (!image || coverLogoFrames.length === 0) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      image.src = coverLogoFrames[coverLogoFrames.length - 1];
      setIsLogoAnimationDone(true);
      return undefined;
    }

    let frameIndex = 0;
    let animationId = 0;
    let startedAt = 0;
    let isCancelled = false;
    const frameDuration = 1000 / COVER_LOGO_FPS;
    const frameCache = new Set([coverLogoFrames[0]]);

    const preloadFrameRange = (startIndex, count) => {
      coverLogoFrames.slice(startIndex, startIndex + count).forEach((frameSrc) => {
        if (frameCache.has(frameSrc)) return;
        frameCache.add(frameSrc);
        preloadImage(frameSrc);
      });
    };

    const preloadRemainingFrames = () => {
      const run = () => preloadFrameRange(COVER_LOGO_INITIAL_PRELOAD, coverLogoFrames.length);
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(run, { timeout: 1600 });
      } else {
        window.setTimeout(run, 600);
      }
    };

    const updateFrame = (time) => {
      if (isCancelled) return;
      if (!startedAt) startedAt = time;

      const nextFrameIndex = Math.min(
        coverLogoFrames.length - 1,
        Math.floor((time - startedAt) / frameDuration)
      );

      if (nextFrameIndex !== frameIndex) {
        frameIndex = nextFrameIndex;
        image.src = coverLogoFrames[frameIndex];
        if (frameIndex % 8 === 0) {
          preloadFrameRange(frameIndex + 1, 18);
        }
      }

      if (frameIndex >= coverLogoFrames.length - 1) {
        setIsLogoAnimationDone(true);
        return;
      }

      animationId = window.requestAnimationFrame(updateFrame);
    };

    image.src = coverLogoFrames[0];
    preloadFrameRange(1, COVER_LOGO_INITIAL_PRELOAD);
    preloadRemainingFrames();

    const startAnimation = () => {
      if (!isCancelled) {
        animationId = window.requestAnimationFrame(updateFrame);
      }
    };

    Promise.race([
      Promise.all(coverLogoFrames.slice(1, COVER_LOGO_INITIAL_PRELOAD).map(preloadImage)),
      new Promise((resolve) => window.setTimeout(resolve, 520)),
    ]).then(startAnimation);

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  useGSAP(
    () => {
      if (!isLogoAnimationDone) {
        gsap.set(".coverRevealItem", { autoAlpha: 0, y: 18 });
        return undefined;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".coverRevealItem", { autoAlpha: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".coverRevealItem",
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.18,
            clearProps: "transform,visibility",
          }
        );
      });

      return () => {
        mm.revert();
      };
    },
    { dependencies: [isLogoAnimationDone], scope: coverRef, revertOnUpdate: true }
  );

  const handleWheel = useCallback(
    (event) => {
      if (event.deltaY > 8) {
        event.preventDefault();
        onEnter("wheel");
      }
    },
    [onEnter]
  );

  return (
    <section
      className="cover"
      ref={coverRef}
      onWheel={handleWheel}
    >
      <div className="coverSideRays" aria-hidden="true">
        <SideRays
          speed={2.35}
          rayColor1="#20fc10"
          rayColor2="#7cff67"
          intensity={4.25}
          spread={2.28}
          origin="top-right"
          tilt={-8}
          saturation={1.56}
          blend={0.68}
          falloff={1.12}
          opacity={1}
        />
      </div>

      <div className="coverVignette" aria-hidden="true" />

      <div className="coverInner">
        <img
          className="coverLogoAnimation"
          ref={logoFrameRef}
          src={coverLogoFrames[0]}
          alt="FoFo Lab"
          decoding="async"
          fetchPriority="high"
        />
        <p className="coverLine coverRevealItem">Focus、Forward、Become more</p>
        <p className="coverSince coverRevealItem">since 2017</p>
      </div>

      <button
        className="moreLink coverRevealItem"
        type="button"
        ref={moreButtonRef}
        onClick={() => onEnter("click")}
      >
        more +
      </button>
    </section>
  );
}

function SiteNav({ activeView, onHome, onWork, onAbout, onContact }) {
  return (
    <nav className="siteNav siteNav--dark">
      <div className="navLeft">
        <button className="navLogo" type="button" onClick={onHome}>
          <img src={logoWhite} alt="FoFo Lab" />
        </button>

        <div className="navLinks" aria-label="Primary navigation">
          <button type="button" onClick={onHome}>
            home
          </button>
          <button type="button" onClick={onWork}>
            work
          </button>
          <button type="button" onClick={onAbout}>
            about
          </button>
        </div>
      </div>

      <button className="navContact" type="button" onClick={onContact}>
        contact
      </button>
    </nav>
  );
}

function Home({
  activeView,
  shouldPauseIntroExit,
  selectedProjectIndex,
  onShowIntro,
  onShowProjects,
  onSelectProject,
  onNextProject,
  onPreviousProject,
  onOpenProject,
  onHome,
  onContact,
  projects,
}) {
  const projectListRef = useRef(null);
  const imageRailRef = useRef(null);
  const introSectionRef = useRef(null);
  const hasSetLoopPosition = useRef(false);
  const lastProjectSwitchRef = useRef(0);
  const boundarySwitchRef = useRef({ direction: null, time: 0 });
  const introBoundaryRef = useRef(null);
  const tailFrameRef = useRef(0);
  const repeatedProjects = useMemo(
    () =>
      [0, 1, 2].flatMap((loop) =>
        projects.map((project, index) => ({
          ...project,
          index,
          loop,
          loopKey: `${loop}-${project.title}`,
        }))
      ),
    [projects]
  );
  const selectedProject = projects[selectedProjectIndex] ?? projects[0];
  const selectedImages =
    selectedProject?.images.length ? selectedProject.images : [selectedProject?.cover];

  const handleIntroWheel = useCallback(
    (event) => {
      if (event.deltaY > 8) {
        event.preventDefault();
        if (!shouldPauseIntroExit) {
          introBoundaryRef.current = null;
          onShowProjects();
          return;
        }

        const now = performance.now();
        if (introBoundaryRef.current === null) {
          introBoundaryRef.current = now;
          return;
        }

        if (now - introBoundaryRef.current < 500) return;
        introBoundaryRef.current = null;
        onShowProjects();
      } else if (event.deltaY < -8) {
        introBoundaryRef.current = null;
      }
    },
    [onShowProjects, shouldPauseIntroExit]
  );

  const updateVisibleCardScale = useCallback(() => {
    const list = projectListRef.current;
    if (!list) return;

    if (tailFrameRef.current) cancelAnimationFrame(tailFrameRef.current);
    tailFrameRef.current = requestAnimationFrame(() => {
      const cards = [...list.querySelectorAll(".projectCard")];
      const listRect = list.getBoundingClientRect();
      const visibleCards = cards.filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.bottom > listRect.top + 4 && rect.top < listRect.bottom - 4;
      });

      cards.forEach((card) => {
        card.removeAttribute("data-tail");
      });

      visibleCards.slice(-2).forEach((card, tailIndex) => {
        card.dataset.tail = String(tailIndex + 1);
      });
    });
  }, []);

  const alignProjectCardToTop = useCallback((index) => {
    const list = projectListRef.current;
    if (!list) return;

    const targetCard = list.querySelector(
      `[data-project-index="${index}"][data-loop="1"]`
    );
    if (!targetCard) return;

    const previousCard = targetCard.previousElementSibling;
    const secondSlotOffset = previousCard
      ? targetCard.offsetTop - previousCard.offsetTop
      : 0;

    list.scrollTop = targetCard.offsetTop - list.offsetTop - secondSlotOffset;
    updateVisibleCardScale();
  }, [updateVisibleCardScale]);

  const canSwitchProject = useCallback(() => {
    const now = performance.now();
    if (now - lastProjectSwitchRef.current < 720) return false;
    lastProjectSwitchRef.current = now;
    return true;
  }, []);

  const canSwitchAtBoundary = useCallback((direction) => {
    const now = performance.now();
    const state = boundarySwitchRef.current;
    const isSameBoundary = state.direction === direction && now - state.time >= 500;

    boundarySwitchRef.current = { direction, time: now };
    return isSameBoundary;
  }, []);

  const showPreviousProject = useCallback(() => {
    if (!canSwitchProject()) return;
    boundarySwitchRef.current = { direction: null, time: 0 };
    if (imageRailRef.current) imageRailRef.current.scrollTop = 0;
    onPreviousProject();
  }, [canSwitchProject, onPreviousProject]);

  const handleProjectsWheel = useCallback(
    (event) => {
      if (event.deltaY >= -8) return;

      const imageRail = event.target.closest?.(".projectImageRail");
      if (imageRail && imageRail.scrollTop > 0) {
        boundarySwitchRef.current = { direction: null, time: 0 };
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (!canSwitchAtBoundary("previous")) return;
      showPreviousProject();
    },
    [canSwitchAtBoundary, showPreviousProject]
  );

  const handleProjectListScroll = useCallback(() => {
    const list = projectListRef.current;
    if (!list) return;

    const third = list.scrollHeight / 3;
    if (!third) return;

    if (list.scrollTop < third * 0.08) {
      list.scrollTop += third;
    } else if (list.scrollTop > third * 1.98) {
      list.scrollTop -= third;
    }

    updateVisibleCardScale();
  }, [updateVisibleCardScale]);

  const handleProjectListWheel = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleProjectSelect = useCallback(
    (index) => {
      boundarySwitchRef.current = { direction: null, time: 0 };
      lastProjectSwitchRef.current = 0;
      if (imageRailRef.current) imageRailRef.current.scrollTop = 0;
      onSelectProject(index);
    },
    [onSelectProject]
  );

  const showNextProject = useCallback(() => {
    if (!canSwitchProject()) return;
    boundarySwitchRef.current = { direction: null, time: 0 };
    if (imageRailRef.current) imageRailRef.current.scrollTop = 0;
    onNextProject();
  }, [canSwitchProject, onNextProject]);

  const handleImageRailWheel = useCallback(
    (event) => {
      const rail = imageRailRef.current;
      if (!rail) return;

      const atBottom = rail.scrollTop + rail.clientHeight >= rail.scrollHeight - 8;
      if (event.deltaY > 8 && atBottom) {
        event.preventDefault();
        event.stopPropagation();
        if (!canSwitchAtBoundary("next")) return;
        showNextProject();
      } else if (!atBottom && event.deltaY > 0) {
        boundarySwitchRef.current = { direction: null, time: 0 };
      }
    },
    [canSwitchAtBoundary, showNextProject]
  );

  useEffect(() => {
    if (activeView !== "projects" || !projects.length) return undefined;

    const frame = requestAnimationFrame(() => {
      alignProjectCardToTop(selectedProjectIndex);
      hasSetLoopPosition.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [activeView, alignProjectCardToTop, projects.length, selectedProjectIndex]);

  useEffect(() => {
    if (activeView !== "projects") return undefined;

    window.addEventListener("resize", updateVisibleCardScale);
    updateVisibleCardScale();
    return () => {
      window.removeEventListener("resize", updateVisibleCardScale);
    };
  }, [activeView, updateVisibleCardScale]);

  useGSAP(
    () => {
      if (activeView !== "intro") return undefined;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".introAnim", { autoAlpha: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".introAnim",
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.86,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.12,
            clearProps: "transform,visibility",
          }
        );
      });

      return () => mm.revert();
    },
    { dependencies: [activeView], scope: introSectionRef, revertOnUpdate: true }
  );

  return (
    <main className={`home home--${activeView}`} id="home">
      <SiteNav
        activeView={activeView}
        onHome={onHome}
        onWork={onShowProjects}
        onAbout={onShowIntro}
        onContact={onContact}
      />

      <section
        className="introSection"
        ref={introSectionRef}
        aria-label="FoFo profile"
        onWheel={handleIntroWheel}
      >
        <div className="introKicker introAnim">It&apos;s FoFo</div>

        <div className="introGrid">
          <div className="portraitFrame introAnim">
            {portraitImage ? (
              <img
                src={portraitImage}
                alt="FoFo portrait"
                loading="eager"
                decoding="async"
                fetchPriority="low"
              />
            ) : (
              <span>肖像图待补充</span>
            )}
          </div>

          <div className="introCopy">
            <h1 className="introAnim">Visual Designer / AI Creative Designer</h1>

            <div className="introBioGrid introAnim">
              <p>
                With 9 years of experience in visual design, I&apos;ve worked with
                leading internet companies to create digital products, brand
                experiences, and visual systems. Passionate about photography,
                skiing, thoughtful exploration, and turning ideas into meaningful
                creations.
              </p>
            </div>
          </div>
        </div>

        <div className="introLogoStrip introAnim" aria-label="Selected company logos">
          {introLogos.map((logo, index) => (
            <img
              key={logo}
              src={logo}
              alt={`Selected logo ${index + 1}`}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </section>

      <section
        className="projectsSection"
        aria-label="Project showcase"
        onWheel={handleProjectsWheel}
      >
        <div className="worksLayout">
          <aside className="worksSidebar">
            <EyeTracker className="eyeTracker--sidebar" />

            <div className="projectList" aria-label="Project list">
              <div
                className="projectListLoop"
                ref={projectListRef}
                onScroll={handleProjectListScroll}
                onWheel={handleProjectListWheel}
              >
              {repeatedProjects.map((project) => {
                const isActiveProject =
                  project.index === selectedProjectIndex && project.loop === 1;

                return (
                  <button
                    className={`projectCard ${
                      isActiveProject ? "projectCard--active" : ""
                    }`}
                    type="button"
                    key={project.loopKey}
                    data-loop={project.loop}
                    data-project-index={project.index}
                    aria-current={isActiveProject ? "true" : undefined}
                    onClick={() => handleProjectSelect(project.index)}
                  >
                    <span className="projectCardTop">
                      <span>{String(project.index + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="projectCardBody">
                      <span className="projectThumbWrap">
                        <img
                          src={project.cover}
                          alt={`${project.title} cover`}
                          loading={project.loop === 1 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </span>
                      <span className="projectMeta">
                        <strong>{project.title}</strong>
                        <span>{project.intro}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
              </div>
            </div>
          </aside>

          <div
            className="projectImageRail"
            ref={imageRailRef}
            aria-label={`${selectedProject.title} project images`}
            onWheel={handleImageRailWheel}
          >
            <div className="projectImageSet" key={selectedProject.title}>
              {selectedImages.map((image, imageIndex) => (
                  <div
                    className="projectImageButton"
                    role="button"
                    tabIndex={0}
                    key={`${selectedProject.title}-${image}`}
                    onClick={() => onOpenProject(selectedProject, imageIndex)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenProject(selectedProject, imageIndex);
                      }
                    }}
                  >
                    <img
                      src={image}
                      alt={`${selectedProject.title} project image ${imageIndex + 1}`}
                      loading={imageIndex === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={imageIndex === 0 ? "high" : "auto"}
                    />
                  </div>
              ))}

              <button className="nextProjectButton" type="button" onClick={showNextProject}>
                more +
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="contactOverlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="contactPanel" onClick={(event) => event.stopPropagation()}>
        <button className="contactClose" type="button" onClick={onClose} aria-label="Close contact">
          <img src={quitIcon} alt="" aria-hidden="true" />
        </button>
        <p className="contactLabel">Contact</p>
        <h2>Let&apos;s make something vivid.</h2>
        <p className="contactIntro">
          For visual design, AI creative work, campaigns, and brand systems.
        </p>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>
              <a href="mailto:fofo362573@gmail.com">fofo362573@gmail.com</a>
            </dd>
          </div>
          <div>
            <dt>WeChat</dt>
            <dd>im-FoFo</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>Shanghai</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function ProjectOverlay({ project, images, initialIndex = 0, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0))
  );
  const activeImage = images[activeImageIndex] ?? images[0];

  const showPreviousImage = useCallback(() => {
    setActiveImageIndex((index) => (index - 1 + images.length) % images.length);
  }, [images.length]);

  const showNextImage = useCallback(() => {
    setActiveImageIndex((index) => (index + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, showNextImage, showPreviousImage]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`${project.title} detail viewer`}>
      <button className="closeButton" type="button" onClick={onClose} aria-label="Close viewer">
        <img src={quitIcon} alt="" aria-hidden="true" />
      </button>

      <button
        className="overlayHit overlayHit--prev"
        type="button"
        aria-label="Previous image"
        onClick={showPreviousImage}
      />
      <button
        className="overlayHit overlayHit--next"
        type="button"
        aria-label="Next image"
        onClick={showNextImage}
      />

      <div className="overlayImageStage">
        {activeImage ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={`${project.title} detail ${activeImageIndex + 1}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        ) : null}
      </div>

      <div className="overlayDots" aria-label={`${activeImageIndex + 1} of ${images.length}`}>
        {images.map((image, index) => (
          <button
            className={`overlayDot ${index === activeImageIndex ? "overlayDot--active" : ""}`}
            type="button"
            key={`${image}-dot`}
            aria-label={`Show image ${index + 1}`}
            aria-current={index === activeImageIndex ? "true" : undefined}
            onClick={() => setActiveImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [bootState, setBootState] = useState("loading");
  const [bootProgress, setBootProgress] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeView, setActiveView] = useState("intro");
  const [shouldPauseIntroExit, setShouldPauseIntroExit] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [activeProject, setActiveProject] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const enrichedProjects = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        images: getProjectImages(project.folder),
      })),
    []
  );

  useEffect(() => {
    let isCancelled = false;
    const criticalAssets = uniqueAssets([
      eyeVideo,
      logoWhite,
      ...coverLogoFrames,
      portraitImage,
      ...introLogos,
    ]);
    const totalAssets = Math.max(criticalAssets.length, 1);
    let completedAssets = 0;
    const startedAt = performance.now();

    const markComplete = () => {
      completedAssets += 1;
      if (!isCancelled) {
        setBootProgress(completedAssets / totalAssets);
      }
    };

    const loadAsset = (asset) => {
      const loader = /\.(mp4|mov|webm)(\?|$)/i.test(asset) ? preloadVideo : preloadImage;
      return loader(asset).then(markComplete);
    };

    Promise.all(criticalAssets.map(loadAsset)).then(() => {
      const elapsed = performance.now() - startedAt;
      const finishDelay = Math.max(0, 760 - elapsed);

      window.setTimeout(() => {
        if (isCancelled) return;
        setBootProgress(1);
        setBootState("leaving");

        window.setTimeout(() => {
          if (!isCancelled) setBootState("done");
        }, 520);
      }, finishDelay);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bootState !== "done") return undefined;

    let isCancelled = false;
    let idleId = 0;
    const queuedProjectAssets = uniqueAssets([
      ...enrichedProjects.map((project) => project.cover),
      ...enrichedProjects.map((project) => project.images[0]),
      ...enrichedProjects.flatMap((project) => project.images),
    ]);
    let assetIndex = 0;

    const loadNextProjectAsset = () => {
      if (isCancelled || assetIndex >= queuedProjectAssets.length) return;
      const asset = queuedProjectAssets[assetIndex];
      assetIndex += 1;
      preloadImage(asset).finally(() => {
        if (!isCancelled) idleId = runIdleTask(loadNextProjectAsset, 1200);
      });
    };

    idleId = runIdleTask(loadNextProjectAsset, 1100);

    return () => {
      isCancelled = true;
      if (idleId) cancelIdleTask(idleId);
    };
  }, [bootState, enrichedProjects]);

  const openProject = useCallback(
    (project, initialImageIndex = 0) => {
      const match = enrichedProjects.find((item) => item.title === project.title);
      setActiveProject(match ? { ...match, initialImageIndex } : null);
    },
    [enrichedProjects]
  );

  const enterSite = useCallback((entryMethod = "click") => {
    setHasEntered(true);
    setActiveView("intro");
    setShouldPauseIntroExit(entryMethod === "wheel");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }, []);

  const returnToCover = useCallback(() => {
    setActiveProject(null);
    setIsContactOpen(false);
    setActiveView("intro");
    setShouldPauseIntroExit(false);
    setHasEntered(false);
  }, []);

  const showProjects = useCallback(() => {
    setHasEntered(true);
    setShouldPauseIntroExit(false);
    setActiveView("projects");
  }, []);

  const showIntro = useCallback(() => {
    setHasEntered(true);
    setShouldPauseIntroExit(false);
    setActiveView("intro");
  }, []);

  const showNextProject = useCallback(() => {
    setSelectedProjectIndex((index) => (index + 1) % enrichedProjects.length);
  }, [enrichedProjects.length]);

  const showPreviousProject = useCallback(() => {
    setSelectedProjectIndex(
      (index) => (index - 1 + enrichedProjects.length) % enrichedProjects.length
    );
  }, [enrichedProjects.length]);

  return (
    <>
      {bootState !== "done" ? (
        <BootLoader progress={bootProgress} isLeaving={bootState === "leaving"} />
      ) : !hasEntered ? (
        <Cover onEnter={enterSite} />
      ) : (
        <Home
          activeView={activeView}
          shouldPauseIntroExit={shouldPauseIntroExit}
          selectedProjectIndex={selectedProjectIndex}
          projects={enrichedProjects}
          onHome={returnToCover}
          onShowIntro={showIntro}
          onShowProjects={showProjects}
          onSelectProject={setSelectedProjectIndex}
          onNextProject={showNextProject}
          onPreviousProject={showPreviousProject}
          onOpenProject={openProject}
          onContact={() => setIsContactOpen(true)}
        />
      )}

      {activeProject ? (
        <ProjectOverlay
          project={activeProject}
          images={
            activeProject.images.length ? activeProject.images : [activeProject.cover]
          }
          initialIndex={activeProject.initialImageIndex ?? 0}
          onClose={() => setActiveProject(null)}
        />
      ) : null}

      {isContactOpen ? <ContactModal onClose={() => setIsContactOpen(false)} /> : null}
    </>
  );
}
