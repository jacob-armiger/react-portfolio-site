
export default function Resume() {
    return (
      <div className="flex h-screen w-auto flex-col-reverse items-center sm:ml-4 sm:flex-row">
        <iframe
          className="h-5/6 w-11/12 rounded-lg border border-b-4 border-black md:w-8/12"
          src="/resume.pdf"
        />
        <p className="mb-14 ml-4 mt-8 sm:mx-4 sm:mb-16">
          This is my resume. I've redacted some personal information.
        </p>
      </div>
    );
}