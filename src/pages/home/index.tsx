import React from "react";
import { Force } from "./components/Force";
import { List } from "./components/List";
import { SearchId } from "./components/Search"

export const Home: React.FC = () => {
    return (
        <div className="flex h-full">
            <div className="w-1/4 border mx-2">
                <div className="m-2">
                    <SearchId />
                </div>
                <div className="m-2 border">
                    <List />
                </div>
            </div>
            <div className="flex-1 border mx-2">
                <div className="m-2">操作</div>
                <div className="m-2 border">
                    <Force />
                </div>
            </div>
            <div className="w-1/4 border mx-2">
                <div className="m-2">操作</div>
                <div className="m-2">操作</div>
            </div>
        </div>
    );
};
