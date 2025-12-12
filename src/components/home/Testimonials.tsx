import { Star, Quote } from "lucide-react";
import { mockTestimonials } from "@/data/mockData";

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            What Our <span className="text-primary">Users Say</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join thousands of satisfied users who have successfully applied for government jobs using our platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="hover-lift relative rounded-2xl border border-border bg-card p-6"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>

              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? "fill-primary text-primary" : "text-muted"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
