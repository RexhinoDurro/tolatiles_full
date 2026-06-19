import ProjectsLayout from '@/components/admin/projects/ProjectsLayout';
import ProjectEditor from '@/components/admin/projects/ProjectEditor';

interface EditProjectPageProps {
  params: { id: string };
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const projectId = parseInt(params.id, 10);
  return (
    <ProjectsLayout title="Edit Project" hideDefaultPadding>
      <ProjectEditor projectId={projectId} />
    </ProjectsLayout>
  );
}
