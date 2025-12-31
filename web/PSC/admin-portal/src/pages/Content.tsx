
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EventsTab from "@/components/content/EventsTab"
import ClubRulesTab from "@/components/content/ClubRulesTab"
import AnnouncementsTab from "@/components/content/AnnouncementsTab"
import AboutUsTab from "@/components/content/AboutUsTab"
import PromotionalAdsTab from "@/components/content/PromotionalAdsTab"

export default function Content() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Content Management</h2>
        <p className="text-muted-foreground">Manage website content including events, rules, and announcements.</p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-4 ">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          {/* <TabsTrigger value="announcements">Announcements</TabsTrigger> */}
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="events">
            <EventsTab />
          </TabsContent>
          <TabsContent value="rules">
            <ClubRulesTab />
          </TabsContent>
          <TabsContent value="announcements">
            <AnnouncementsTab />
          </TabsContent>
          <TabsContent value="about">
            <AboutUsTab />
          </TabsContent>
          <TabsContent value="ads">
            <PromotionalAdsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}