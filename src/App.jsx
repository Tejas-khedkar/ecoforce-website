import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { upcomingDrives, pastDrives, totalKg, formatDate, formatKg, ABOUT } from "./data";
import {
  useGLTF,
  RoundedBox,
  MeshTransmissionMaterial,
  Environment,
  Text,
  Sparkles,
} from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useRoute, navigate, Page, ContactModal, PAGE_ROUTES } from "./Pages";

const TARGET_HEIGHT = 1.6; // how tall the bag appears
const TRAIL_LENGTH = 24; // how far down the trail goes (bigger = longer journey)
const ITEM_COUNT = 90; // how many plastic items along the trail
const INTRO = 1.8; // bigger = more scrolling before the first panel shows up

const FONT = "/AbrilFatface-Regular.ttf"; // must match the file in your public folder

// ---------- EDIT YOUR CONTENT HERE ----------
const BRAND = "EcoForce";
const TAGLINE = "Pune's hills were made for sunsets, not wrappers.";
const PRINT_COLOR = "#06281f"; // colour of the print on the bag

// text on the panels comes from data.js, so it updates by itself
const clip = (s, n = 42) => (s.length > n ? s.slice(0, n - 3) + "..." : s);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const nextDrive = upcomingDrives()[0];
const donePast = pastDrives();
const latestDrive = donePast[0];

const PANELS = [
    {
    title: "ABOUT US",
    route: "about",
    lines: ABOUT.panelLines,
    colors: ["#3be8b0", "#1f8fd1", "#2b3a9f"],
  },
  {
    title: "UPCOMING DRIVES",
    route: "upcoming",
    lines: nextDrive
      ? [clip(nextDrive.title), clip(`${formatDate(nextDrive.date)}, ${nextDrive.location}`)]
      : ["No drives scheduled yet", "Check back soon"],
    colors: ["#1fd1e8", "#2a5bd7", "#8a3ffc"],
  },
  {
    title: "PAST DRIVES",
    route: "past",
    lines: latestDrive
      ? [`173 completed`, clip(`Latest: ${latestDrive.title}`)]
      : ["Our completed drives", "will appear here"],
    colors: ["#ffb347", "#ff6a3d", "#c0392b"],
  },
  {
    title: "PLASTIC COLLECTED",
    route: "plastic",
    lines: [`~3000 kg collected so far`, `across 173 drives`],
    colors: ["#ff4d6d", "#c0245e", "#3a1c71"],
  },
];
// --------------------------------------------

// one shared scroll value that the camera, bag, panels and menu all use
const scroll = { target: 0, progress: 0 };

const smooth = (x) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

// jump to a panel by its position in the list
const goTo = (i) => {
  scroll.target = (i + INTRO) / (PANELS.length + INTRO);
};

function ScrollDriver() {
  useEffect(() => {
    const move = (amount) => {
      scroll.target = Math.min(1, Math.max(0, scroll.target + amount));
    };
    const onWheel = (e) => move(e.deltaY * 0.00028); // scroll speed

    let lastY = 0;
    const onTouchStart = (e) => (lastY = e.touches[0].clientY);
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      move((lastY - y) * 0.0012);
      lastY = y;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useFrame(() => {
    scroll.progress += (scroll.target - scroll.progress) * 0.07;
  });

  return null;
}

// moves the camera down the trail, and carries the panels along with it
function Rig({ children }) {
  const ref = useRef();
  useFrame((state) => {
    const y = -scroll.progress * TRAIL_LENGTH;
    state.camera.position.y = y;
    if (ref.current) ref.current.position.y = y;
  });
  return <group ref={ref}>{children}</group>;
}

// dark navy with teal glow top-left and purple glow along the bottom
function GradientBackground() {
  const { scene } = useThree();

  useEffect(() => {
    const S = 1024;
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0b1226";
    ctx.fillRect(0, 0, S, S);

    const glow = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x * S, y * S, 0, x * S, y * S, r * S);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);
    };
    glow(0.02, 0.05, 0.8, "rgba(47,230,216,0.9)");
    glow(0.2, 1.0, 0.75, "rgba(106,75,255,0.95)");
    glow(1.0, 1.0, 0.6, "rgba(106,75,255,0.7)");

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;

    return () => {
      scene.background = null;
      tex.dispose();
    };
  }, [scene]);

  return null;
}

// the name + line printed on one side of the bag
function BagPrint({ info, flip }) {
  const { w, h } = info;
  const z = flip ? info.back - 0.015 : info.front + 0.015;
  const y = -h * 0.04;

  return (
    <group position={[0, 0, z]} rotation={[0, flip ? Math.PI : 0, 0]}>
      <Text
        font={FONT}
        position={[0, y, 0]}
        fontSize={w * 0.14}
        letterSpacing={0.01}
        anchorX="center"
        anchorY="middle"
        color={PRINT_COLOR}
        renderOrder={5}
      >
        {BRAND}
      </Text>
      <Text
        font={FONT}
        position={[0, y - w * 0.11, 0]}
        fontSize={w * 0.05}
        lineHeight={1.25}
        maxWidth={w * 0.55}
        textAlign="center"
        anchorX="center"
        anchorY="top"
        color={PRINT_COLOR}
        renderOrder={5}
      >
        {TAGLINE}
      </Text>
    </group>
  );
}

function Bag() {
  const groupRef = useRef();
  const frontRef = useRef();
  const backRef = useRef();
  const { scene } = useGLTF("/plastic-bag.glb");

  const { offset, scale, info } = useMemo(() => {
    scene.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      offset: center.clone().negate(),
      scale: TARGET_HEIGHT / size.y,
      info: {
        w: size.x,
        h: size.y,
        front: box.max.z - center.z,
        back: box.min.z - center.z,
      },
    };
  }, [scene]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const p = scroll.progress;
    const early = smooth(p / 0.25); // the bag does its turn while it leaves
    g.rotation.y = early * Math.PI * 2;
    g.rotation.x = Math.sin(early * Math.PI) * 0.3;
    g.position.y = -p * TRAIL_LENGTH * 0.5; // rises out of view as the camera drops

    // show the print only on the side that faces the viewer
    const facing = Math.cos(g.rotation.y);
    if (frontRef.current) frontRef.current.visible = facing > 0.05;
    if (backRef.current) backRef.current.visible = facing < -0.05;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene} position={offset} />
      <group ref={frontRef}>
        <BagPrint info={info} />
      </group>
      <group ref={backRef}>
        <BagPrint info={info} flip />
      </group>
    </group>
  );
}

useGLTF.preload("/plastic-bag.glb");

// ---------- the plastic trail ----------
function buildTrail() {
  const lathe = (pts) =>
    new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 20);

  const bottle = lathe([
    [0.001, 0], [0.12, 0], [0.17, 0.04], [0.175, 0.14], [0.16, 0.18],
    [0.175, 0.22], [0.175, 0.5], [0.15, 0.58], [0.08, 0.68], [0.07, 0.78],
    [0.001, 0.78],
  ]);
  bottle.translate(0, -0.39, 0);

  const cup = lathe([[0.001, 0], [0.12, 0], [0.2, 0.5], [0.215, 0.53]]);
  cup.translate(0, -0.25, 0);

  const straw = new THREE.CylinderGeometry(0.014, 0.014, 0.8, 8);
  const cap = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20);

  // a crinkled sheet, like a wrapper or a torn bag
  const wrapper = new THREE.PlaneGeometry(0.6, 0.4, 10, 8);
  const pos = wrapper.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 14) * 0.03 + Math.cos(y * 18 + x * 6) * 0.03);
  }
  wrapper.computeVertexNormals();

  const mk = (color, opacity) =>
    new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.12,
      metalness: 0,
      clearcoat: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  const mats = [
    mk("#e6f7ff", 0.42), // clear
    mk("#7fc8ff", 0.55), // blue
    mk("#8be8b0", 0.55), // green
    mk("#ffffff", 0.75), // white
    mk("#ffd08a", 0.6), // amber
  ];

  // seeded random so the trail looks the same every time
  let s = 42;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const types = ["bottle", "bottle", "bottle", "cup", "cup", "wrapper", "wrapper", "wrapper", "cap", "straw"];
  const sizeBoost = { bottle: 1.4, cup: 1.4, wrapper: 1.5, cap: 2.4, straw: 1.3 };

  const items = [];
  for (let i = 0; i < ITEM_COUNT; i++) {
    const t = i / (ITEM_COUNT - 1);
    const y = -1.6 - t * (TRAIL_LENGTH + 0.5) + (rnd() - 0.5) * 0.5;
    const x = Math.sin(y * 0.45) * 1.3 + (rnd() - 0.5) * 2.4; // winding path
    const z = -1.0 - rnd() * 2.4; // behind the panels
    const type = types[Math.floor(rnd() * types.length)];
    items.push({
      type,
      pos: [x, y, z],
      rot: [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28],
      scale: (0.9 + rnd() * 0.9) * sizeBoost[type],
      mat: Math.floor(rnd() * mats.length),
      spin: (rnd() - 0.5) * 0.012,
    });
  }

  return { geos: { bottle, cup, straw, cap, wrapper }, mats, items };
}

function Trail() {
  const groupRef = useRef();
  const { geos, mats, items } = useMemo(() => buildTrail(), []);

  // slow tumbling
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.children.forEach((m, i) => {
      m.rotation.y += items[i].spin;
      m.rotation.z += items[i].spin * 0.6;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <mesh
          key={i}
          geometry={geos[it.type]}
          material={mats[it.mat]}
          position={it.pos}
          rotation={it.rot}
          scale={it.scale}
        />
      ))}
    </group>
  );
}

// ---------- the panels ----------
// paints a colourful "image" for the front of a card
function makeCardTexture(colors, seed) {
  const W = 768;
  const H = 480;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");

  let s = seed * 1234 + 17;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const rounded = (x, y, w, h, r) => {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  };

  rounded(0, 0, W, H, 40);
  ctx.save();
  ctx.clip();

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 14; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 60 + rnd() * 160;
    const col = colors[Math.floor(rnd() * 3)];
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col + "cc");
    rg.addColorStop(1, col + "00");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  rounded(3, 3, W - 6, H - 6, 38);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function GlassPanel({ index, count, title, lines, colors, route, size = [2.3, 1.45, 0.05] }) {
  const groupRef = useRef();
  const planeRef = useRef();
  const textRef = useRef();
  const activeRef = useRef(false); // true only while this panel is the one in front
  const { viewport } = useThree();
  const [w, h, thick] = size;
  const side = index % 2 === 0 ? -1 : 1; // alternate left / right
  const texture = useMemo(() => makeCardTexture(colors, index + 1), [colors, index]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;

    // dist: 0 = this panel is in focus, >0 = still to come, <0 = already passed
    const focus = -INTRO + scroll.progress * (count + INTRO);
    const dist = index - focus;

    if (dist <= -0.85 || dist >= 1.7) {
      g.visible = false;
      activeRef.current = false;
      return;
    }
    g.visible = true;
    activeRef.current = Math.abs(dist) < 0.35;

    const fit = Math.min(1, viewport.width / 4.1); // shrink on narrow screens
    let x, y, z, ry, sc;

    if (dist >= 0) {
      const e = Math.min(dist, 2);
      x = side * (0.5 + 1.5 * e);
      y = side * 0.12 * e;
      z = -1.8 * e;
      ry = -side * (0.12 + 0.45 * Math.min(dist, 1));
      sc = (1 - (0.25 * Math.min(dist, 1.5)) / 1.5) * (1 - smooth((dist - 1.3) / 0.4));
    } else {
      const k = -dist;
      x = side * (0.5 + 2.6 * k);
      y = 0.4 * k;
      z = 3.2 * k;
      ry = -side * 0.12 + side * 1.0 * k;
      sc = 1;
    }

    const bob = Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.03;
    g.position.set(x * fit, y + bob, z);
    g.rotation.set(0.04, ry, side * 0.02);
    g.scale.setScalar(Math.max(sc * fit, 0.001));

        // cards further away are shaded a little darker
    if (planeRef.current) {
      planeRef.current.material.color.setScalar(
        1 - (0.4 * Math.min(Math.max(dist, 0), 1.5)) / 1.5
      );
    }
    if (textRef.current) {
      const ts = 1 - smooth((Math.abs(dist) - 0.25) / 0.55);
      textRef.current.scale.setScalar(Math.max(ts, 0.001));
    }
  });

  // clicking only works on the panel that is in front, and only if it has a page
  const onOver = () => {
    if (route && activeRef.current) document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    document.body.style.cursor = "auto";
  };
  const onClick = () => {
    if (route && activeRef.current) {
      document.body.style.cursor = "auto";
      navigate(route);
    }
  };

  return (
    <group
      ref={groupRef}
      visible={false}
      onClick={onClick}
      onPointerOver={onOver}
      onPointerOut={onOut}
    >
            <RoundedBox args={size} radius={0.07} smoothness={6}>
        <meshStandardMaterial color={colors[1]} roughness={0.45} metalness={0.1} />
      </RoundedBox>

            <mesh ref={planeRef} position={[0, 0, thick / 2 + 0.003]}>
        <planeGeometry args={[w - 0.03, h - 0.03]} />
        <meshBasicMaterial map={texture} alphaTest={0.5} toneMapped={false} />
      </mesh>

      <group ref={textRef} position={[0, 0, thick / 2 + 0.02]}>
        <Text
          font={FONT}
          position={[-w / 2 + 0.16, h / 2 - 0.16, 0]}
          fontSize={0.06}
          letterSpacing={0.1}
          anchorX="left"
          anchorY="top"
          color="white"
          renderOrder={2}
        >
          {`0${index + 1} / 0${count}`}
        </Text>
        
        <Text
          font={FONT}
          position={[0, 0.12, 0]}
          fontSize={0.17}
          letterSpacing={0.02}
          maxWidth={w - 0.4}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="white"
          renderOrder={3}
        >
          {title}
        </Text>

        {lines.map((line, i) => (
          <Text
            key={i}
            font={FONT}
            position={[0, -0.3 - i * 0.13, 0]}
            fontSize={0.075}
            maxWidth={w - 0.4}
            textAlign="center"
            anchorX="center"
            anchorY="top"
            color="white"
            renderOrder={3}
          >
            {line}
          </Text>
        ))}

        {route && (
          <Text
            font={FONT}
            position={[0, -h / 2 + 0.14, 0]}
            fontSize={0.055}
            letterSpacing={0.15}
            anchorX="center"
            anchorY="bottom"
            color="white"
            fillOpacity={0.85}
            renderOrder={3}
          >
            CLICK TO VIEW
          </Text>
        )}
      </group>
    </group>
  );
}

// menu bar along the top of the screen (shown on every page)
function Overlay({ onContact }) {
  return (
    <div className="overlay">
      <nav className="menu">
        <button
          className="logo-btn"
          onClick={() => {
            scroll.target = 0; // back to the start of the home scene
            navigate("home");
          }}
        >
          <img
            src="/logo2.png"
            alt="EcoForce logo"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </button>

        {PANELS.map((panel, i) => (
          <button
            key={panel.title}
            className="item"
            onClick={() => {
              goTo(i); // fly to that panel...
              navigate("home"); // ...and make sure we are on the home scene
            }}
          >
            {panel.title}
          </button>
        ))}
        <button className="ask" onClick={onContact}>
          CONTACT US
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const [contactOpen, setContactOpen] = useState(false);
  const isPage = PAGE_ROUTES.includes(route);

  return (
    <>
      {/* the 3D scene only runs on the home screen */}
      {!isPage && (
        <Canvas
          camera={{ position: [0, 0, 4], fov: 35 }}
          style={{ position: "fixed", inset: 0 }}
        >
          <ScrollDriver />
          <GradientBackground />
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 4, 5]} intensity={2} />
          <Environment preset="city" />

          {/* particles spread along the whole trail */}
          <Sparkles
            count={400}
            scale={[8, TRAIL_LENGTH + 8, 5]}
            size={3}
            speed={0.4}
            opacity={0.8}
            color="#bfe9ff"
            position={[0, -TRAIL_LENGTH / 2, -1.5]}
          />

          <Bag />
          <Trail />

          {/* the panels travel down the trail with the camera */}
          <Rig>
            {PANELS.map((panel, i) => (
              <GlassPanel key={panel.title} index={i} count={PANELS.length} {...panel} />
            ))}
          </Rig>
        </Canvas>
      )}

      {isPage && <Page route={route} />}

      <Overlay onContact={() => setContactOpen(true)} />
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}
