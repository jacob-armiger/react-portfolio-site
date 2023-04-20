
export default function Resume() {
    return (
      <div className="flex h-screen w-auto items-center justify-center">
        <iframe
          className="h-5/6 w-11/12 border border-2 border-black md:w-8/12"
          src="/AWS resume.pdf"
        />
      </div>
    );
}