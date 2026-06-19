import ProjectsLayout from '@/components/admin/projects/ProjectsLayout';
import ProjectEditor from '@/components/admin/projects/ProjectEditor';

export default function NewProjectPage() {
  return (
    <ProjectsLayout title="New Project" hideDefaultPadding>
      <ProjectEditor />
    </ProjectsLayout>
  );
}
