import { ArrowLeft, Mail, User, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background pt-8 sm:pt-12 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl mt-12 sm:mt-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Contact Me</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect with the creator behind RoadResQ. Let's talk about the future of roadside assistance.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="p-6 sm:p-10 space-y-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Who am I?</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    I am a Software Engineer based in Coimbatore, Tamil Nadu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Future Plan & Investment</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Any investor who wants to collaborate, please contact me. My future plan is to connect users to mechanics in real-time, solving problems end-to-end with lesser time and lesser cost.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Email</h3>
                  <p className="mt-2 text-muted-foreground">
                    <a href="mailto:support@roadresq.in" className="text-primary hover:underline font-medium">
                      support@roadresq.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
