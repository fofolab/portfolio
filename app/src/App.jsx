import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const logoWhite = new URL("../../logo/fofolab白@2x.png", import.meta.url).href;

const detailModules = import.meta.glob("../../PJ*/*.{jpg,jpeg,png,JPG,JPEG,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
});

const coverModules = import.meta.glob(
  "../../项目封面/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const collator = new Intl.Collator("zh-Hans-CN", {
  numeric: true,
  sensitivity: "base",
});

const cover = (filename) => coverModules[`../../项目封面/${filename}`];

const projects = [
  {
    title: "电影宣发设计",
    titleEn: "Movie Promotion Design",
    folder: "PJ1-电影宣发设计",
    cover: cover("电影宣发设计-封面.jpg"),
  },
  {
    title: "2025暑期档",
    titleEn: "Summer Season 2025",
    folder: "PJ2-暑期档2025",
    cover: cover("2025暑期档-封面.jpg"),
  },
  {
    title: "2026暑期档",
    titleEn: "Summer Season 2026",
    folder: "PJ4-暑期档2026",
    cover: cover("2026暑期档-封面-1.jpg"),
  },
  {
    title: "微信跨年营销",
    titleEn: "WeChat New Year Campaign",
    folder: "PJ5-微信跨年营销",
    cover: cover("微信跨年营销-封面.jpg"),
  },
  {
    title: "哈利波特专题",
    titleEn: "Harry Potter Feature",
    folder: "PJ6-哈利波特专题",
    cover: cover("哈利波特专题-封面.jpg"),
  },
  {
    title: "聚光好戏",
    titleEn: "Spotlight Theatre Picks",
    folder: "PJ7-聚光好戏",
    cover: cover("聚光好戏-封面.jpg"),
  },
  {
    title: "大麦NFT设计",
    titleEn: "Damai NFT Design",
    folder: "PJ8-大麦NFT",
    cover: cover("大麦NFT设计-封面.jpg"),
  },
  {
    title: "大麦焕新设计",
    titleEn: "Damai Brand Refresh",
    folder: "PJ9-大麦焕新",
    cover: cover("大麦焕新设计-封面.jpg"),
  },
  {
    title: "会员场馆海报",
    titleEn: "Member Venue Posters",
    folder: "PJ10会员场馆海报",
    cover: cover("会员场馆海报-封面.jpg"),
  },
  {
    title: "会员徽章设计",
    titleEn: "Member Badge Design",
    folder: "PJ11会员徽章设计",
    cover: cover("会员徽章设计-封面.jpg"),
  },
  {
    title: "电影票根设计",
    titleEn: "Movie Ticket Stub Design",
    folder: "PJ12电影票根设计",
    cover: cover("电影票根设计-封面.jpg"),
  },
];

const companies = ["Alibaba", "Tencent", "Apple", "Nike", "Netflix", "Disney"];

function getProjectImages(folder) {
  return Object.entries(detailModules)
    .filter(([path]) => path.startsWith(`../../${folder}/`))
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([, url]) => url);
}

function Cover({ onEnter, trailImages }) {
  const [trail, setTrail] = useState([]);
  const lastPoint = useRef({ x: 0, y: 0, time: 0 });
  const idRef = useRef(0);
  const moreButtonRef = useRef(null);

  const isNearMoreButton = useCallback((event) => {
    const button = moreButtonRef.current;
    if (!button) return false;

    const rect = button.getBoundingClientRect();
    const buffer = 96;

    return (
      event.clientX >= rect.left - buffer &&
      event.clientX <= rect.right + buffer &&
      event.clientY >= rect.top - buffer &&
      event.clientY <= rect.bottom + buffer
    );
  }, []);

  const handleMove = useCallback(
    (event) => {
      if (isNearMoreButton(event)) {
        setTrail([]);
        lastPoint.current = {
          x: event.clientX,
          y: event.clientY,
          time: performance.now(),
        };
        return;
      }

      const now = performance.now();
      const dx = event.clientX - lastPoint.current.x;
      const dy = event.clientY - lastPoint.current.y;
      const distance = Math.hypot(dx, dy);

      if (!trailImages.length || (distance < 32 && now - lastPoint.current.time < 80)) {
        return;
      }

      lastPoint.current = { x: event.clientX, y: event.clientY, time: now };
      const image = trailImages[Math.floor(Math.random() * trailImages.length)];
      const id = idRef.current + 1;
      idRef.current = id;

      const item = {
        id,
        image,
        x: event.clientX,
        y: event.clientY,
        size: 82 + Math.random() * 112,
        opacity: 0.18 + Math.random() * 0.32,
        rotate: -12 + Math.random() * 24,
      };

      setTrail((items) => [...items.slice(-13), item]);
      window.setTimeout(() => {
        setTrail((items) => items.filter((entry) => entry.id !== id));
      }, 900);
    },
    [isNearMoreButton, trailImages]
  );

  return (
    <section className="cover" onMouseMove={handleMove}>
      <div className="trailLayer" aria-hidden="true">
        {trail.map((item) => (
          <img
            key={item.id}
            className="trailImage"
            src={item.image}
            style={{
              left: item.x,
              top: item.y,
              width: item.size,
              opacity: item.opacity,
              transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
            }}
            alt=""
          />
        ))}
      </div>

      <div className="coverInner">
        <img className="coverLogo" src={logoWhite} alt="FoFo Lab" />
        <p className="coverLine">Focus、Forward、Become more</p>
        <p className="coverSince">since 2017</p>
      </div>

      <button
        className="moreLink"
        type="button"
        ref={moreButtonRef}
        onMouseEnter={() => setTrail([])}
        onFocus={() => setTrail([])}
        onClick={onEnter}
      >
        more +
      </button>
    </section>
  );
}

function Home({ onOpenProject }) {
  return (
    <main className="home" id="home">
      <section className="introSection" aria-label="FoFo profile">
        <div className="introKicker">It's FoFo</div>

        <div className="introGrid">
          <div className="portraitPlaceholder">
            <span>Portrait</span>
          </div>

          <div className="introCopy">
            <p>
              FoFo is a visual designer exploring bold ideas through thoughtful
              systems, campaigns, and digital moments.
            </p>
          </div>
        </div>

        <div className="companyStrip" aria-label="Served company placeholders">
          {companies.map((company) => (
            <span key={company}>{company}</span>
          ))}
        </div>
      </section>

      <section className="projectsSection" aria-label="Project showcase">
        <div className="sectionTitle">
          <span>Selected Works</span>
          <span>{projects.length.toString().padStart(2, "0")}</span>
        </div>

        <div className="projectMasonry">
          {projects.map((project, index) => (
            <button
              className="projectCard"
              type="button"
              key={project.title}
              onClick={() => onOpenProject(project)}
            >
              <span className="projectIndex">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <img src={project.cover} alt={`${project.title} cover`} />
              <span className="projectMeta">
                <strong>{project.title}</strong>
                <span>{project.titleEn}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectOverlay({ project, images, onClose }) {
  const imageRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <button className="closeButton" type="button" onClick={onClose}>
        Close
      </button>

      <aside className="overlayNav">
        <div>
          <p className="overlayLabel">Project</p>
          <h2>{project.title}</h2>
          <p>{project.titleEn}</p>
        </div>

        <nav aria-label={`${project.title} image navigation`}>
          {images.map((_, index) => (
            <button
              key={`${project.title}-${index}`}
              type="button"
              onClick={() =>
                imageRefs.current[index]?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              {(index + 1).toString().padStart(2, "0")}
            </button>
          ))}
        </nav>
      </aside>

      <div className="overlayImages">
        {images.map((image, index) => (
          <img
            key={image}
            ref={(node) => {
              imageRefs.current[index] = node;
            }}
            src={image}
            alt={`${project.title} detail ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  const enrichedProjects = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        images: getProjectImages(project.folder),
      })),
    []
  );

  const trailImages = useMemo(
    () => enrichedProjects.flatMap((project) => project.images),
    [enrichedProjects]
  );

  const openProject = useCallback(
    (project) => {
      const match = enrichedProjects.find((item) => item.title === project.title);
      setActiveProject(match);
    },
    [enrichedProjects]
  );

  const enterSite = useCallback(() => {
    setHasEntered(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, []);

  return (
    <>
      {!hasEntered ? (
        <Cover onEnter={enterSite} trailImages={trailImages} />
      ) : (
        <Home onOpenProject={openProject} />
      )}

      {activeProject ? (
        <ProjectOverlay
          project={activeProject}
          images={activeProject.images}
          onClose={() => setActiveProject(null)}
        />
      ) : null}
    </>
  );
}
