import { Link } from "react-router-dom";
import { ArrowUpRight, Award, BookOpen, Github, Linkedin } from "lucide-react";
import { useSiteSettings } from "../../hooks/useSiteSettings";
export const PlatformDirectory = () => {
  const { settings } = useSiteSettings();
  const platforms = [
    {
      name: "GitHub",
      body: "Source code, Linux automation and project documentation.",
      url: settings.socials.github,
      icon: Github,
    },
    {
      name: "Credly",
      body: "Explore my public digital credential profile.",
      url: settings.socials.credly,
      icon: Award,
    },
    {
      name: "LinkedIn",
      body: "Professional profile and a direct way to connect.",
      url: settings.socials.linkedin,
      icon: Linkedin,
    },
    ...(settings.socials.medium
      ? [
          {
            name: "Medium",
            body: "Articles and technical reflections on Medium.",
            url: settings.socials.medium,
            icon: BookOpen,
          },
        ]
      : []),
  ];
  return (
    <div className="platform-directory">
      {platforms.map(({ name, body, url, icon: Icon }) => (
        <a className="platform-link" key={name} href={url} target="_blank" rel="noreferrer">
          <Icon size={23} strokeWidth={1.5} />
          <div>
            <h3>{name}</h3>
            <p>{body}</p>
          </div>
          <ArrowUpRight size={22} />
        </a>
      ))}
      <Link className="platform-link" to="/writing">
        <BookOpen size={23} strokeWidth={1.5} />
        <div>
          <h3>Field notes</h3>
          <p>Technical writing, practical learning and reflections.</p>
        </div>
        <ArrowUpRight size={22} />
      </Link>
    </div>
  );
};
