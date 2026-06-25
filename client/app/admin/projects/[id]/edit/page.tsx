import ProjectsLayout from '@/components/admin/projects/ProjectsLayout';
import ProjectEditor from '@/components/admin/projects/ProjectEditor';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const unwrappedParams = await params;
  const projectId = parseInt(unwrappedParams.id, 10);
  return (
    <ProjectsLayout title="Edit Project" hideDefaultPadding>
      <ProjectEditor projectId={projectId} />
    </ProjectsLayout>
  );
}
