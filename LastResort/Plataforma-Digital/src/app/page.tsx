import Link from "next/link";
import { ArrowRight, CircleCheck, Clock, Play } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CourseIcon } from "@/components/CourseIcon";
import { SUPPORT_MAIL } from "@/components/AppShell";
import { courseHours, listCourses, type Course } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function Home() {
  let courses: Course[] = [];
  try { courses = await listCourses(); } catch (e) { console.error("Landing: não foi possível listar cursos", e); }
  return (
    <>
      <header className="site-nav">
        <div className="container">
          <Logo />
          <nav aria-label="Principal">
            <a href="#cursos">Cursos</a><a href="#como-funciona">Como funciona</a>
            <Link className="btn btn-outline btn-sm" href="/login">Entrar</Link>
            <Link className="btn btn-primary btn-sm" href="/cadastro">Cadastrar-se</Link>
          </nav>
        </div>
      </header>
      <section className="hero">
        <div className="container">
          <div>
            <span className="eyebrow">Seu futuro é digital</span>
            <h1>Aprenda tecnologia de forma simples e segura</h1>
            <p className="lead">Mais autonomia para o seu dia a dia. Cursos acessíveis para navegar, se conectar e cuidar dos seus dados com confiança.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/cadastro"><ArrowRight aria-hidden />Começar a aprender</Link>
              <a className="btn btn-outline" href="#cursos">Conhecer os cursos</a>
            </div>
            <p className="hero-note"><CircleCheck aria-hidden />Do primeiro clique à sua próxima conquista. No seu ritmo.</p>
          </div>
          <div className="hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero.jpg" alt="Mulher sorrindo enquanto usa um notebook em casa" />
            <div className="hero-badge"><span className="ico"><Play aria-hidden size={18} /></span><div><small>Aprenda na prática</small><strong>Mais segurança a cada clique</strong></div></div>
          </div>
        </div>
      </section>
      <section className="section" id="cursos">
        <div className="container">
          <h2>Conhecimento que faz parte da vida</h2>
          <p className="sub">Escolha por onde começar. A gente acompanha você.</p>
          {courses.length === 0 ? <p>Os cursos estarão disponíveis em breve.</p> : (
            <div className="course-cards">
              {courses.map((c) => (
                <article className="course-card-l" key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <CourseIcon icon={c.icon} /><span className={`pill ${c.icon === "laptop" ? "pill-green" : "pill-blue"}`}>{c.level.replace("Nível", "Nível")}</span>
                  </div>
                  <h3>{c.name}</h3><p>{c.summary}</p>
                  <div className="meta-line"><Clock aria-hidden />{courseHours(c)} &nbsp;&nbsp; {c.lessons} aulas</div>
                  <div className="card-foot"><span>{c.teacherName ?? "Professor a definir"}</span><Link className="link-inline" href="/cadastro">Ver curso <ArrowRight aria-hidden /></Link></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section section-alt" id="como-funciona">
        <div className="container">
          <h2 style={{ marginBottom: 24 }}>Como funciona</h2>
          <div className="steps">
            <div className="step"><span className="n">1</span><div><h3>Crie sua conta</h3><p>Um cadastro simples para começar sua jornada de aprendizado.</p></div></div>
            <div className="step"><span className="n">2</span><div><h3>Escolha seu curso</h3><p>Encontre o conhecimento que faz sentido para o seu dia a dia.</p></div></div>
            <div className="step"><span className="n">3</span><div><h3>Aprenda no seu ritmo</h3><p>Assista às aulas e coloque cada descoberta em prática.</p></div></div>
          </div>
          <p style={{ marginTop: 28, fontSize: 14 }}>É professor e quer compartilhar o que sabe? <Link className="link" href="/cadastro/professor">Crie sua conta de professor</Link>.</p>
        </div>
      </section>
      <footer className="site-footer">
        <div className="container">
          <div><Logo /><small className="tagline">Educação que aproxima. Tecnologia que inclui.</small></div>
          <span>© 2026 EduDigital</span>
          <div className="footer-links"><a href={SUPPORT_MAIL}>Ajuda</a><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link></div>
        </div>
      </footer>
    </>
  );
}
