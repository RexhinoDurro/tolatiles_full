import ProjectsLayout from '@/components/admin/projects/ProjectsLayout';
import ServicePinsManager from '@/components/admin/projects/ServicePinsManager';

export default function ServicePinsPage() {
  return (
    <ProjectsLayout title="Service Pins">
      <ServicePinsManager />
    </ProjectsLayout>
  );
}
