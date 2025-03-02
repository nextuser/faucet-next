// context.ts
class ProjectContext {
    private static instance: ProjectContext;
    private data: {
        someData: string;
        counter: number;
    };

    private constructor() {
        this.data = {
            someData: 'This is some data in the project context',
            counter: 0
        };
    }

    public static getInstance(): ProjectContext {
        if (!ProjectContext.instance) {
            ProjectContext.instance = new ProjectContext();
        }
        return ProjectContext.instance;
    }

    public getData(): { someData: string; counter: number } {
        return this.data;
    }

    public incrementCounter(): void {
        this.data.counter++;
    }
}

export default ProjectContext.getInstance();
