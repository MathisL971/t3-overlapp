import { Button } from "~/components/ui/button";
import { getEvent } from "~/server/queries/events";
import type { event } from "~/server/db/schema";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";

type Event = typeof event.$inferSelect;

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const { id } = params;

    const event: Event | undefined = await getEvent(Number(id));

    if (!event) {
        return (
            <div>
                <h1>Event not found</h1>
                <p className="mt-2">The event you are looking for does not exist.</p>
                <a href="/">
                    <Button type="button" className="mt-4">
                        Back to events
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/events">Events</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            {event.title}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className="m-0">{event.title}</h1>
            {children}
        </div>
    )
}