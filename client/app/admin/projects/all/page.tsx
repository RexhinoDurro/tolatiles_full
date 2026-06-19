import ProjectsLayout from '@/components/admin/projects/ProjectsLayout';
import AllProjectsContent from '@/components/admin/projects/AllProjectsContent';

export default function AllProjectsPage() {
  return (
    <ProjectsLayout title="Projects">
      <AllProjectsContent />
    </ProjectsLayout>
  );
}
