import { useEffect, useState } from "react";
import {
  CONTACT,
  ABOUT,
  upcomingDrives,
  pastDrives,
  totalKg,
  formatDate,
  formatKg,
  dayOf,
  monthOf,
} from "./data";

// ---------- tiny page switcher: uses the part of the address after the # ----------
export const PAGE_ROUTES = ["upcoming", "past", "plastic", "about"];

const read = () => window.location.hash.replace(/^#\/?/, "") || "home";

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const navigate = (route) => {
  window.location.hash = route === "home" ? "" : "/" + route;
};

// ---------- shared page layout ----------
function Shell({ title, subtitle, children }) {
  return (
    <div className="page">
      <div className="page-inner">
        <button className="back" onClick={() => navigate("home")}>
          BACK TO HOME
        </button>
        <h1>{title}</h1>
        <p className="sub">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function UpcomingPage() {
  const drives = upcomingDrives();
  return (
    <Shell title="UPCOMING DRIVES" subtitle="Join us at our next plastic collection drives.">
      {drives.length === 0 && (
        <p className="empty">No drives are scheduled right now. Please check back soon.</p>
      )}
      {drives.map((d) => (
        <article className="card" key={d.title + d.date}>
          <div className="date">
            <b>{dayOf(d.date)}</b>
            <span>{monthOf(d.date)}</span>
          </div>
          <div className="info">
            <h2>{d.title}</h2>
            <p>
              {d.time} | {d.location}
            </p>
            {d.notes && <p className="note">{d.notes}</p>}
          </div>
        </article>
      ))}
    </Shell>
  );
}

function PastPage() {
  const drives = pastDrives();
  const [openDrive, setOpenDrive] = useState(null); // which drive is opened
  const [photo, setPhoto] = useState(null); // the photo shown full screen

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPhoto(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Shell title="PAST DRIVES" subtitle="Some notable drives so far. Click a drive to see more.">
      {drives.length === 0 && <p className="empty">Our completed drives will appear here.</p>}
      {drives.map((d) => {
        const key = d.title + d.date;
        const isOpen = openDrive === key;
        const photos = d.photos || [];
        const toggle = () => setOpenDrive(isOpen ? null : key);

        return (
          <div className="drive" key={key}>
            <article
              className={"card clickable" + (isOpen ? " open" : "")}
              role="button"
              tabIndex={0}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
            >
              <div className="date">
                <b>{dayOf(d.date)}</b>
                <span>{monthOf(d.date)}</span>
              </div>
              <div className="info">
                <h2>{d.title}</h2>
                <p>
                  {formatDate(d.date)} | {d.location}
                </p>
                {d.description && <p className="note">{d.description}</p>}
                <span className="hint">
                  {isOpen ? "HIDE DETAILS" : "CLICK TO SEE PHOTOS AND PARTICIPANTS"}
                </span>
              </div>
              {d.kg ? (
                <div className="kg">
                  <b>{formatKg(d.kg)}</b>
                  <span>KG</span>
                </div>
              ) : null}
            </article>

            {isOpen && (
              <div className="details">
                {d.participants ? (
                  <div className="participants">
                    <b>{d.participants}</b>
                    <span>PARTICIPANTS</span>
                  </div>
                ) : null}

                {photos.length > 0 ? (
                  <div className="photos">
                    {photos.map((name) => (
                      <button
                        className="photo"
                        key={name}
                        onClick={() => setPhoto(`/photos/${name}`)}
                      >
                        <img
                          src={`/photos/${name}`}
                          alt={d.title}
                          loading="lazy"
                          onError={(e) => (e.currentTarget.parentElement.style.display = "none")}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="empty">Photos from this drive will be added soon.</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {photo && (
        <div className="lightbox" onClick={() => setPhoto(null)}>
          <img src={photo} alt="Drive photo" />
        </div>
      )}
    </Shell>
  );
}

function PlasticPage() {
  const drives = pastDrives();
  const max = Math.max(1, ...drives.map((d) => Number(d.kg) || 0));
  return (
    <Shell title="PLASTIC COLLECTED" subtitle="Every kilogram counts. Here is what each drive brought in.">
      <div className="total">
        <b>'~3000'</b>
        <span>KG COLLECTED IN TOTAL</span>
      </div>
      {drives.length === 0 && <p className="empty">Numbers from our drives will appear here.</p>}
      {drives.map((d) => (
        <div className="bar-row" key={d.title + d.date}>
          <div className="bar-head">
            <span>{d.title}</span>
            <span>{formatKg(d.kg)} kg</span>
          </div>
          <div className="bar">
            <div style={{ width: `${((Number(d.kg) || 0) / max) * 100}%` }} />
          </div>
          <small>
            {formatDate(d.date)} | {d.location}
          </small>
        </div>
      ))}
    </Shell>
  );
}

function AboutPage() {
  return (
    <Shell title="ABOUT US" subtitle="Who we are and why we do this.">
      <p className="about-mission">{ABOUT.mission}</p>
      {ABOUT.story.map((paragraph, i) => (
        <p className="about-text" key={i}>
          {paragraph}
        </p>
      ))}
      <h2 className="about-heading">WHAT WE DO</h2>
      <div className="points">
        {ABOUT.points.map((pt) => (
          <div className="point" key={pt.title}>
            <h3>{pt.title}</h3>
            <p>{pt.text}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function Page({ route }) {
  if (route === "upcoming") return <UpcomingPage />;
  if (route === "past") return <PastPage />;
  if (route === "plastic") return <PlasticPage />;
  if (route === "about") return <AboutPage />;
  return null;
}

// ---------- the pop-up shown by "Contact us" ----------
export function ContactModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">
          x
        </button>
        <h2>CONTACT US</h2>

        <div className="label">HEAD OF THE ORGANISATION</div>
        <div className="value">{CONTACT.name}</div>
        <div className="role">{CONTACT.role}</div>

        <div className="label">EMAIL</div>
        <a className="value" href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>

        <div className="label">PHONE</div>
        <a className="value" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
          {CONTACT.phone}
        </a>
      </div>
    </div>
  );
}
