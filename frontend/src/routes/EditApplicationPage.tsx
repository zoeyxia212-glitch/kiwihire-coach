import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";
import ResourceNotFoundState from "../components/ResourceNotFoundState";
import {
  getApplicationById,
  ResourceNotFoundError,
  updateApplication,
} from "../utils/api";

export default function EditApplicationPage() {
  const { id } = useParams();
  const [initialValues, setInitialValues] =
    useState<ApplicationFormValues | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    async function fetchApplication() {
      if (!id) {
        setErrorMessage("Application ID is missing.");
        return;
      }

      try {
        const application = await getApplicationById(id);

        setInitialValues({
          company: application.company,
          roleTitle: application.roleTitle,
          location: application.location ?? "",
          status: application.status,
          jobDescription: application.jobDescription,
          closingDate: application.closingDate ?? "",
          source: application.source ?? "",
          workMode: application.workMode ?? "",
          workRightsRequirement:
            application.workRightsRequirement ?? "",
          salaryRange: application.salaryRange ?? "",
          contactPerson: application.contactPerson ?? "",
          jobUrl: application.jobUrl ?? "",
          careerLevel: application.careerLevel ?? "",
          employmentType: application.employmentType ?? "",
          graduateFriendly: application.graduateFriendly,
          sponsorshipAvailable: application.sponsorshipAvailable,
          industry: application.industry ?? "",
        });
      } catch (error) {
        if (error instanceof ResourceNotFoundError) {
          setIsNotFound(true);
        } else {
          setErrorMessage("Failed to load application.");
        }
      }
    }

    fetchApplication();
  }, [id]);

  async function handleUpdate(values: ApplicationFormValues) {
    if (!id) {
      throw new Error("Application ID is missing.");
    }

    await updateApplication(id, values);

    window.location.href = `/applications/${id}`;
  }

  if (isNotFound) {
    return (
      <ResourceNotFoundState
        title="This application cannot be edited."
        message="It may have been deleted, or it may belong to another account."
        backTo="/applications"
        backLabel="Back to applications"
      />
    );
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  if (!initialValues) {
    return <p>Loading application...</p>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Edit application</p>
          <h1>Update application.</h1>
          <p className="muted">
            Update the role information and application status.
          </p>
        </div>
      </div>

      <ApplicationForm
        initialValues={initialValues}
        submitLabel="Update application"
        onSubmit={handleUpdate}
      />
    </section>
  );
}
